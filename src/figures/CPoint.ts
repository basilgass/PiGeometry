import {Figure} from "./Figure";
import {GeometryPi} from "../GeometryPi";

export class CPoint extends Figure {
    private _x: number;
    private _y: number;
    private _scale: number;
    private _rule: {[key:string] : string};

    constructor(geom: GeometryPi, name: string) {
        super(geom, name);
        this._x = 0;
        this._y = 0;
        this._scale = 6;
        this.isPoint = true;

        this.shape = geom.draw.path(
                `M${- this._scale},${- this._scale}
                L${+ this._scale},${+ this._scale}
                M${+ this._scale},${- this._scale}
                L${- this._scale},${+ this._scale}`
        ).stroke('black');

        return this;
    }

    update(): Figure {
        // Calculate the position depending on some rules.
        if(this._rule.rule==='middle'){
            let p1 = this.geometryPi.getPoint(this._rule.p1),
                p2 = this.geometryPi.getPoint(this._rule.p2);
            if(p1===null || p2===null){
                console.log('Middle: one point was not found!');
                return this;
            }

            this._x = (p1.x+p2.x)/2
            this._y = (p1.y+p2.y)/2
        }else if(this._rule.rule==='colinear'){
            let p1 = this.geometryPi.getPoint(this._rule.p1),
                p2 = this.geometryPi.getPoint(this._rule.p2),
                through = this.geometryPi.getPoint(this._rule.through),
                k = 1.0;
            if(p1===null || p2===null){
                console.log('Colinear: one point was not found!');
                return this;
            }

            if(isNaN(Number(this._rule.k))){
                // TODO: Must determine distance between the data given.
            }else{
                k = +this._rule.k
            }

            this._x = through.x + k*(p2.x - p1.x);
            this._y = through.y + k*(p2.y - p1.y);

        }else if(this._rule.rule==='projection'){
            let p = this.geometryPi.getPoint(this._rule.p);
            if(p===null){
                console.log('Projection: reference point not found');
                return this;
            }

            if(this._rule.axis==='Ox'){
                let O = this.geometryPi.mainGrid.getOrigin();
                this._x = p.x;
                this._y = O.y
            }

            if(this._rule.axis==='Oy'){
                let O = this.geometryPi.mainGrid.getOrigin();
                this._x = O.x;
                this._y = p.y
            }
        }

        // Move the shape to the current Point.
        this.shape.center(this._x, this._y);

        return super.update();
    }

    middle(p1: string, p2: string):CPoint {
        this._rule = {
            rule: 'middle',
            p1,
            p2
        };

        this.update();
        return this;
    }

    colinear(p1: string, p2: string, through: string, k?:any):CPoint{
        if(k===undefined){k = 1.0;}

        this._rule = {
            rule: 'colinear',
            p1,
            p2,
            through,
            k
        }

        this.update();
        return this;
    }

    projection(p: string, line: string):CPoint{
        this._rule = {
            rule: 'projection',
            p,
            axis: line
        };
        this.update();
        return this;
    }

    projectionX(p: string):CPoint{
        return this.projection(p, 'Ox');
    }

    projectionY(p: string):CPoint{
        return this.projection(p, 'Oy');
    }

    moveLabel(): Figure {
        if(this.label===null){return this;}
        this.label.move(this._x, this._y);
        return this;
    }

    /* Getter and setter*/
    get x(): number {
        return this._x;
    }

    get y(): number {
        return this._y;
    }

    get scale(): number {
        return this._scale;
    }

    set scale(value: number) {
        this._scale = value;
    }
}