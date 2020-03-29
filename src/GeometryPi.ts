import {SVG, Svg, Marker, Point, Element} from "@svgdotjs/svg.js"
import "@svgdotjs/svg.draggable.js"

import {Grid} from "./figures/grid";
/*import {gPoint} from "./figures/gPoint";
import {gCircle} from "./figures/gCircle";
import {gSegment} from "./figures/gSegment";
import {gGrid} from "./grid";
import {texLabel} from "./texLabel";*/

export interface IPoint {
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

        return this;
    }

    dev(): GeometryPi {
        let C = this._draw.circle(80).move(100, 150).stroke({width: 1, color: 'black'}).fill('rgba(200,200,0,0.5)');
        this._grids[0].showIntersections();
        this.makeDraggable(C, this._grids[0]);
        return this;
    }

    makeDraggable(element:Element, grid?:Grid):GeometryPi{
        element.draggable();

        if(grid!==undefined){
            let that = this;
            function gridConstrain(e: any){
                const {handler, box} = e.detail;
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

            element.on('dragmove', gridConstrain);
        }

        return this;
    }

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
}