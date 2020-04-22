import {Figure} from "./Figure";
import {GeometryPi, IPoint} from "../GeometryPi";

export class Circle extends Figure {
    private _center: string;
    private _radius: string[]|number;

    constructor(geom: GeometryPi, name: string) {
        super(geom, name);
        this._center = '';
        this._radius = 0;

        // Create the shape
        this.shape = geom.draw.circle(
            this.diameter
        ).stroke('black').fill('none');

        return this;
    }

    center(center:string):Circle{
        this._center = center;
        this.update();
        return this;
    }

    radius(radius:string[]|number):Circle{
        this._radius=radius;
        this.update();
        return this;
    }

    update(): Figure {
        // Move the shape to the current Point.
        let p = this.geometryPi.getPoint(this._center),
            d = this.diameter;

        if(p===null){return this;}
        this.shape.center(p.x, p.y)
            .width(d)
            .height(d);

        return this;
    }

    /* Getter and setter*/
    get getRadius():number {
        if(Array.isArray(this._radius)){
            return this.distance(this._radius[0], this._radius[1]);
        }else{
            return this._radius;
        }
    }

    get diameter():number {
        return this.getRadius*2;
    }

}