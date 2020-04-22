import {Marker, SVG, Svg} from "@svgdotjs/svg.js"
import "@svgdotjs/svg.draggable.js"

import {Grid} from "./Grid";
import {Figure} from "./figures/Figure";
import {Point} from "./figures/Point";
import {Line} from "./figures/Line";
import {Circle} from "./figures/Circle";
import {CPoint} from "./figures/CPoint";
import {Arc} from "./figures/Arc";

export interface IPoint {
    name?: string,
    x: number,
    y: number
}
export class GeometryPi {
    private _container: HTMLElement;
    private _svgWrapper: HTMLElement;
    private _svg: HTMLElement;
    private _draw: Svg;
    private _width: number;
    private _height: number;
    private _grids: Grid[];
    private _figures: Figure[];
    private _points: {[key: string]: Point}

    private _origin: IPoint;

    constructor(containerID: string, width: number, height: number) {
        this._container = document.getElementById(containerID);
        this._svgWrapper = document.createElement('DIV');
        this._svgWrapper.style.position = 'relative';
        this._svgWrapper.style.width = '100%';
        this._svgWrapper.style.height = '100%';
        this._container.appendChild(this._svgWrapper);

        this._width = width;
        this._height = height;
        this._draw = SVG().addTo(this._svgWrapper).size('100%', '100%');
        this._draw.viewbox(0, 0, this._width, this._height);

        this._grids = [];
        this._points = {};
        this._figures = [];

        return this;
    }

    dev(): GeometryPi {
        let C = this._draw.circle(80).move(100, 150).stroke({width: 1, color: 'black'}).fill('rgba(200,200,0,0.5)');
        this._grids[0].showIntersections();
        //this.makeDraggable(C, this._grids[0]);
        return this;
    }

    makeDraggableGPI(figure:Point, grid?:Grid):GeometryPi{
        if(figure.dragShape===null){
            // Assume the figure is a Point.
            figure.dragShape = this._draw
                .circle(30).center(figure.x, figure.y)
                .fill('rgba(8,255,103,0.2)')
                .stroke('rgba(79,172,113,0.84)');
        }
        figure.dragShape.draggable();

        let that = this;

        function dragMove(e: any) {
            const {handler, box} = e.detail;

            // Handle the grid if asked
            if(grid!==undefined){
                e.preventDefault();
                let {x, y} = box,
                    pt = grid.nearestPoint({x: x + box.width/2, y: y + box.height/2});

                // Prevent going out of the draw limits.
                if(x<0){return;}
                if(x>that.width-box.width/2){return;}
                if(y<0){return;}
                if(y>that.height-box.width/2){return;}
                handler.move(pt.x - box.width/2, pt.y - box.height/2);
            }

            // Update the figures.
            for(let f of that._figures){
                f.update();
            }
        }

        figure.dragShape.on('dragmove', dragMove);

        return this;
    }

    /* Grid functions */
    showGridOrtho(x: number, y?: number):GeometryPi{
        this._grids.push(new Grid(this).orthographic(x, y));
        return this;
    }

    showGridOrthoN(x: number, y?: number):GeometryPi{
        if(y===undefined){
            this._grids.push(new Grid(this).orthographic(this._width/x));
        }else{
            this._grids.push(new Grid(this).orthographic(this._width/x, this._height/y));
        }

        return this;
    }

    showGridTri(triangleWidth: number):GeometryPi{
        this._grids.push(new Grid(this).triangle(triangleWidth));
        return this;
    }

    showGridHex(hexWidth: number):GeometryPi{
        this._grids.push(new Grid(this).hexagonal(hexWidth));
        return this;
    }

    /* Show all points label */
    showPointsLabel(show?:Boolean):GeometryPi {
        for(let p of this._figures){
            if(p.isPoint) {
                show===false?p.hideLabel():p.showLabel();
            }
        }
        return this;
    }

    showLabels(show?:Boolean):GeometryPi {
        for(let p of this._figures){
            show===false?p.hideLabel():p.showLabel();
        }
        return this;
    }

    /* Main part of creating all figures: placing a Point */
    addPoint(name: string, x?:number, y?:number){
        if(x===undefined){
            console.log('Add calculated point');
            return this.addCPoint(name);
        }

        if(x!==undefined && y!==undefined){
            console.log('Add simple point');
            return this.addSPoint(name, x, y);
        }
    }

    addSPoint(name:string, x:number, y:number):Point {
        let p = this._grids[0].getPoint({x, y});
        p.name = name;
        this._points[name] = new Point(this, name, p.x, p.y)
        this._figures.push(this._points[name]);
        return this._points[name];
    }

    addCPoint(name: string):CPoint{
        let cp = new CPoint(this, name);
        this._figures.push(cp);
        return cp;
    }

    addFigure(constructionString: string):GeometryPi{

        let r:RegExpMatchArray[];

        // Simple Point
        r = [...constructionString.matchAll(/([A-Z][0-9]*)\(([0-9\.]+),([0-9\.]+)\)/g)];
        if(r.length===1){
            console.log(`Add point ${r[0][1]}(${r[0][2]};${r[0][3]})`);
            this.addSPoint(r[0][1], +r[0][2], +r[0][3]);
        }

        // Perpendicular line
        r = [...constructionString.matchAll(/p\]([A-Z][0-9]*)([A-Z][0-9]*)\[/g)];
        if(r.length===1){
            console.log(`A perpendicular line through ${r[0][1]} and ${r[0][2]}`);
            this._figures.push(
                new Line(this, constructionString, r[0][1], r[0][2], {
                    rule: 'p',
                    through: r[0][1]
                }).line()
            );
            return this;
        }

        // Mediatrice line
        r = [...constructionString.matchAll(/m\]([A-Z][0-9]*)([A-Z][0-9]*)\[/g)];
        if(r.length===1){
            console.log(`A perpendicular line through ${r[0][1]} and ${r[0][2]}`);
            this._figures.push(
                new Line(this, constructionString, r[0][1], r[0][2], {
                    rule: 'p',
                    through: 'middle'
                }).line()
            );
            return this;
        }

        // Line
        r = [...constructionString.matchAll(/\]([A-Z][0-9]*)([A-Z][0-9]*)\[/g)];
        if(r.length===1){
            console.log(`A line through ${r[0][1]} and ${r[0][2]}`);
            this._figures.push(
                new Line(this, constructionString, r[0][1], r[0][2]).line()
            );
            return this;
        }

        // Segment
        r = [...constructionString.matchAll(/\[([A-Z][0-9]*)([A-Z][0-9]*)\]/g)];
        if(r.length===1){
            console.log(`A segment from ${r[0][1]} to ${r[0][2]}`);
            this._figures.push(
                new Line(this, constructionString, r[0][1], r[0][2]).segment()
            );
            return this;
        }

        // Half-rule
        r = [...constructionString.matchAll(/\[([A-Z][0-9]*)([A-Z][0-9]*)\[/g)];
        if(r.length===1){
            console.log(`A half-rule from ${r[0][1]} through ${r[0][2]}`);
            this._figures.push(
                new Line(this, constructionString, r[0][1], r[0][2]).halfRule()
            );
            return this;
        }

        // Vector
        r = [...constructionString.matchAll(/v([A-Z][0-9]*)([A-Z][0-9]*)/g)];
        if(r.length===1){
            console.log(`A vector from ${r[0][1]} to ${r[0][2]}`);
            this._figures.push(
                new Line(this, constructionString, r[0][1], r[0][2]).vector()
            );
            return this;
        }

        // Circle
        r = [...constructionString.matchAll(/c([A-Z][0-9]*)_([A-Z][0-9]*),([A-Z][0-9]*)([A-Z][0-9]*)/g)];
        if(r.length===1){
            console.log(`A circle ${r[0][1]} centered on ${r[0][2]} and radius of ${r[0][3]}${r[0][4]}`)
            this._figures.push(
                // new Circle(this, r[0][1], r[0][2], [r[0][3],r[0][4]])
            );
            return this;
        }

        // Arc

        // Polygon
        return this;
    }

    getPoint(name:string):Point {
        let pt = (name in this._points)?this._points[name]:null;

        // Might be a calculated point, eg a figure point
        if(pt===null){
            for(let p of this._figures){
                if(p.name===name){
                    // @ts-ignore
                    return p;
                }
            }
        }
        return pt;
    }

    getFigure(name:string):Figure {
        for(let f of this._figures){
            if(f.name===name){return f;}
        }
        return null;
    }

    /* Add single figures. */
    segment(A:string, B:string):Figure{
        let f = new Line(this, `${A}${B}`,A, B)
        this._figures.push(f);
        return f;
    }

    vector(A:string, B:string):Figure{
        let f = new Line(this, `${A}${B}`,A, B).vector();
        this._figures.push(f);
        return f;
    }

    perpendicular(name:string, A: string, B: string, through?: string):Figure{
        let f = new Line(this, name, A, B ).perpendicular(through);
        this._figures.push(f);
        return f;
    }

    circle(name: string, center: string, radius: string[]|number):Figure{
        let f = new Circle(this, name).center(center).radius(radius);
        this._figures.push(f);
        return f;
    }

    arc(name: string, center: string, radius: string[]|number, angles: string[]):Figure{
        let f = new Arc(this, name).center(center).radius(radius).angleABC(angles);
        this._figures.push(f);
        return f;
    }

    get():Figure {
        return this._figures[this._figures.length-1];
    }

    // Getter and setter
    get draw():Svg {
        return this._draw;
    }

    get width(): number {
        return this._width;
    }
    get height(): number {
        return this._height;
    }

    get grids(): Grid[] {
        return this._grids;
    }

    get mainGrid():Grid{
        return this._grids[0];
    }

    get secondaryGrid():Grid{
        return this._grids[1];
    }

    get figures():Figure[]{
        return this._figures;
    }
}