import {Figure} from "./Figure";
import {GeometryPi} from "../GeometryPi";
import {Circle, Path} from "@svgdotjs/svg.js";
import {Grid} from "../Grid";
import {CPoint} from "./CPoint";

export class Point extends Figure {
    private _x: number;
    private _y: number;
    private _scale: number;
    private _draggable: Boolean;
    private _dragShape: Circle;
    private _dragGrid: Grid;
    private _dragCenter: Point;
    private _dragDistance: number;

    constructor(geom: GeometryPi, name: string, x:number, y:number) {
        super(geom, name);
        this._x = x;
        this._y = y;
        this.isPoint = true;

        this._dragGrid = null;
        this._dragDistance = null;

        this._scale = 6;
        this.shape = geom.draw.path(
                `M${- this._scale},${- this._scale}
                L${+ this._scale},${+ this._scale}
                M${+ this._scale},${- this._scale}
                L${- this._scale},${+ this._scale}`
        ).stroke('black').center(x, y);

        return this;
    }

    update(): Figure {
        // Move the shape to the current Point.
        this.shape.center(this._x, this._y);

        // The draggable circle should also be there.
        /*if(this.dragShape!==null){
            if(this.dragShape.cx()!==this._x){this.dragShape.cx(this._x)}
            if(this.dragShape.cy()!==this._y){this.dragShape.cy(this._y)}
        }*/
        return super.update();
    }

    moveLabel(): Figure {
        if(this.label===null){return this;}
        this.label.move(this._x, this._y)
        return this;
    }

    makeDraggable(options?:{[key:string]:any}):Figure{
        // It's already draggable.
        if(this._draggable){return super.makeDraggable();}

        // Mark the point as draggable
        this._draggable = true;

        // Create the drag shape
        this._dragShape = this.geometryPi.draw
            .circle(30)
            .center(this.x, this.y)
            .fill('rgba(8,255,103,0.2)')
            .stroke('rgba(79,172,113,0.84)');

        // Make it draggable
        this._dragShape.draggable();

        // Create the on move function
        let geom = this.geometryPi,
            point = this;

        function dragMove(e: any) {
            const {handler, box} = e.detail;
            let {x, y} = box;

            e.preventDefault();

            // Prevent going out of the draw limits.
            if(x<0){return;}
            if(x>geom.width-box.width/2){return;}
            if(y<0){return;}
            if(y>geom.height-box.width/2){return;}

            // Handle the grid if asked
            if(point.dragGrid!==null){
                let pt = point.dragGrid.nearestPoint({x: x + box.width/2, y: y + box.height/2});
                handler.move(pt.x - box.width/2, pt.y - box.height/2);
            }

            if(point.dragCenter!==null && point.dragDistance!==null && point.dragDistance > 0){
                let d = Math.sqrt(
                    Math.pow(box.x-point.dragCenter.x,2)+
                    Math.pow(box.y-point.dragCenter.y,2)
                );
                handler.move(
                    point.dragCenter.x + (box.x-point.dragCenter.x)/d*point.dragDistance - box.width/2,
                    point.dragCenter.y + (box.y-point.dragCenter.y)/d*point.dragDistance - box.height/2
                )
            }

            if(options!==undefined && options.fn!==undefined){
                options.fn(geom, point, box, handler, options.args);
            }

            // Define the point button
            point.x = handler.el.cx();
            point.y = handler.el.cy();

            // Update the figures and labels
            for(let f of geom.figures){
                f.update();
            }
        }
        this._dragShape.on('dragmove', dragMove);

        return super.makeDraggable();
    }

    setDragGrid(grid: Grid):Point{
        this._dragGrid = grid;
        return this;
    }

    setDistanceTo(center: Point, distance?: number):Point{
        this._dragCenter = center;
        this._dragDistance = distance===undefined?this.distanceTwoPoints(this, center):distance;
        return this;
    }

    /* Getter and setter*/
    get x(): number {
        return this._x;
    }

    set x(value: number) {
        this._x = value;
    }

    get y(): number {
        return this._y;
    }

    set y(value: number) {
        this._y = value;
    }

    get scale(): number {
        return this._scale;
    }

    set scale(value: number) {
        this._scale = value;
    }

    get dragShape(): Circle {
        return this._dragShape;
    }

    set dragShape(value: Circle) {
        this._dragShape = value;
    }


    get dragGrid(): Grid {
        return this._dragGrid;
    }

    get dragCenter(): Point {
        return this._dragCenter;
    }
    get dragDistance(): number {
        return this._dragDistance;
    }
}