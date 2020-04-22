import {Figure} from "./Figure";
import {GeometryPi, IPoint} from "../GeometryPi";
import {Point} from "./Point";

export class Arc extends Figure {
    private _center: string;
    private _radius: string[]|number;
    private _angle: string[]|number[];
    private _markAngle: Boolean;

    constructor(geom: GeometryPi, name: string) {
        super(geom, name);
        this._center = '';
        this._radius = 0;
        this._markAngle = false;

        // Create the shape
        this.shape = geom.draw.path(
            this.describeArc()
        ).stroke('black').fill('None');

        return this;
    }

    center(center: string):Arc {
        this._center = center;
        this.update();
        return this;
    }

    radius(radius:string[]|number):Arc {
        this._radius = radius;
        this.update();
        return this;
    }

    angleABC(angles:string[]):Arc{
        this._angle = angles;
        this.update();
        return this;
    }
    angleStartStop(start: number, stop: number):Arc{
        this._angle = [start, stop];
        this.update();
        return this;
    }

    markAngle():Arc{
        this._markAngle=!this._markAngle;
        console.log(this._markAngle)
        this.update();
        return this;
    }

    marker(enable?:Boolean):Arc{
        if(enable===false){
            this.shape.marker('end', null);
        }else {
            this.shape.marker('end', this.markerEnd);
        }
        return this;
    }
    /**
     * Get coordinate by radius / angle
     * Reference: https://stackoverflow.com/questions/5736398/how-to-calculate-the-svg-path-for-an-arc-of-a-circle
     * @param centerX
     * @param centerY
     * @param radius
     * @param angleInDegrees
     */
    polarToCartesian(centerX:number, centerY:number, radius:number, angleInDegrees:number):IPoint {
        var angleInRadians = -(angleInDegrees) * Math.PI / 180.0;

        return {
            x: centerX + (radius * Math.cos(angleInRadians)),
            y: centerY + (radius * Math.sin(angleInRadians))
        };
    }

    cartesianToAngle(origin:Point, handle:Point):number {
        let angle,
            dx = handle.x-origin.x,
            dy = -(handle.y-origin.y);

        angle = (handle.x-origin.x===0)?90:Math.atan(dy/dx)*180.0/Math.PI;

        // Depending on the position in the grid, modify the value.
        if(dx>=0){
            if(dy>=0){
                // 0 -> 90

            }else{
                // 270->360
                while(angle<270){
                    angle+=180
                }
            }
        }else{
            if(dy>=0){
                // 90->180
                while(angle<90){
                    angle+=180
                }
            }else{
                // 180->270
                while(angle<180){
                    angle+=180
                }
            }
        }


        return angle;
    }
    getAngles():{startAngle: number, endAngle: number}{
        let startAngle=0,
            endAngle=0;

        if(this._angle===undefined){
            return {
                startAngle:null,
                endAngle: null
            }
        }

        if(this._angle.length===2){
            startAngle = +this._angle[0];
            endAngle = +this._angle[1];
        }else if(this._angle.length===3){
            let A = this.geometryPi.getPoint(this._angle[0].toString()),
                B = this.geometryPi.getPoint(this._angle[1].toString()),
                C = this.geometryPi.getPoint(this._angle[2].toString());

            // Get the angles
            startAngle = this.cartesianToAngle(B, A);
            endAngle = this.cartesianToAngle(B, C);
        }
        return {startAngle, endAngle}
    }
    describeArc():string{
        let center = this.geometryPi.getPoint(this._center),
            r = this.getRadius,
            {startAngle, endAngle} = this.getAngles();

        if(center===null){return '';}
        if(r===null || r===0){return '';}
        if(startAngle===null || endAngle===null){return '';}

        let start = this.polarToCartesian(center.x, center.y, r, startAngle),
            end = this.polarToCartesian(center.x, center.y, r, endAngle),
            largeArcFlag = (endAngle - startAngle+360)%360 <= 180 ? 0: 1,
            swipeFlag = 0;

        if(this._markAngle) {
            if (startAngle > endAngle) {
                largeArcFlag = (largeArcFlag + 1) % 2;
                swipeFlag = 1;
            }
        }

        return [
            "M", start.x, start.y,
            "A", r, r, 0, largeArcFlag, swipeFlag, end.x, end.y
        ].join(" ");
    }

    update(): Figure {
        // Move the shape to the current Point.
        let p = this.geometryPi.getPoint(this._center),
            r = this.getRadius;

        this.shape.plot(this.describeArc());
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

}