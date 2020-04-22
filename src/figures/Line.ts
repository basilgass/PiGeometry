import {Figure} from "./Figure";
import {GeometryPi, IPoint} from "../GeometryPi";
import {Marker} from "@svgdotjs/svg.js";

export class Line extends Figure {
    private _p1: string;
    private _p2: string;
    private _conditionRule: { rule: string, through: string, k: string };
    private _stopP1: Boolean;
    private _stopP2: Boolean;
    private _arrowStart: Boolean;
    private _arrowEnd: Boolean;
    private _slope: number;

    constructor(geom: GeometryPi, name: string, p1:string, p2:string, conditionRule?:{rule: string, through: string, k?: string}) {
        super(geom, name);
        this._p1 = p1;
        this._p2 = p2;
        this._conditionRule = {rule:null,through:null,k:null};
        if(conditionRule!==undefined) {
            this._conditionRule.rule = ('rule' in conditionRule) ? conditionRule.rule : '';
            this._conditionRule.through = ('through' in conditionRule) ? conditionRule.through : '';
            this._conditionRule.k = ('k' in conditionRule) ? conditionRule.k : '';
        }

        // Define if the Line is a segment, half rule or Line
        this._stopP1 = true;
        this._stopP2 = true;

        // Define the arrows.
        this._arrowStart = false;
        this._arrowEnd = false;

        // Get the coordinates
        let {x1, y1, x2, y2} = this._getCoordinates();

        // Create the shape
        this.shape = geom.draw.line(
            x1, y1, x2, y2
        ).stroke('black');

        return this;
    }

    private _getCoordinates(){
        let referencePoint = this.geometryPi.getPoint(this._p1),
            p2 = this.geometryPi.getPoint(this._p2),
            l1:IPoint, l2:IPoint;

        this._calculateSlope();

        // Is there a condition rule ?
        if(this._conditionRule.rule==='p'){
            this._calculateSlopePerpendicular();
        }

        // Through point.
        /*if(this._conditionRule.through !== null){
            if(this._conditionRule.through==='middle'){
                let name = `M_${referencePoint.name}${p2.name}`,
                    refPoint = this.geometryPi.getPoint(name);

                if(refPoint===null) {
                    console.log(name);
                }
                referencePoint = this.geometryPi.getPoint(name);

            }else{
                referencePoint = this.geometryPi.getPoint(this._conditionRule.through);

                if(referencePoint===null) {
                    // Restore the default reference point
                    referencePoint = this.geometryPi.getPoint(this._p1);
                }
            }

        }*/

        // TODO: really need to stop the line ?
        if(this._conditionRule.k==='') {
            this.stopP2 = false;
        }else{
            // Determine the length given by k.
            // Might be a number or a reference.
            // TODO: Handle K parameter inside condition rules!
        }


        if(this._stopP1){
            l1 = referencePoint;
        }else{
            if(this.slope!==Infinity) {
                l1 = this._getLinePosAtX((referencePoint.x < p2.x) ? 0 : this.geometryPi.width, referencePoint, p2);
            }else{
                l1 = {x: referencePoint.x, y: 0}
            }
        }

        if(this._stopP2){
            l2 = p2;
        }else{
            if(this.slope!==Infinity) {
                l2 = this._getLinePosAtX((referencePoint.x < p2.x) ? this.geometryPi.width : 0, referencePoint, p2);
            }else{
                l2 = {x: referencePoint.x, y: this.geometryPi.height}
            }
        }

        return {x1: l1.x, y1: l1.y, x2: l2.x, y2: l2.y};
    }

    private _getLinePosAtX(x:number, p1:IPoint, p2:IPoint):IPoint{
        if(this.slope!==Infinity) {
            return {
                x,
                y: x*this.slope+(p1.y - p1.x * this.slope)
            };
        }else{
            return {
                x,
                y: 0
            };
        }
    }

    private _calculateSlope():number {
        let dx: number, dy: number,
            p1 = this.geometryPi.getPoint(this._p1),
            p2 = this.geometryPi.getPoint(this._p2);

        dx = p2.x-p1.x;
        dy = p2.y-p1.y;

        // Same points
        if(dx===0 && dy===0){
            this._slope = null;
        }

        // Vertical
        if(dx===0){
            this._slope = Infinity;
        }

        // Horizontal
        if(dy===0){
            this._slope = 0;
        }

        // Oblique
        this._slope = dy/dx;

        return this._slope;
    }

    private _calculateSlopePerpendicular():number {
        if(this._slope=== 0){
            this._slope = Infinity;
        }else if(this._slope===Infinity){
            this._slope = 0;
        }else{
            this._slope = -1/this._slope;
        }
        return this._slope;
    }

    update(): Figure {
        // Move the shape to the current Point.
        let {x1, y1, x2, y2} = this._getCoordinates();
        this.shape.plot(x1, y1, x2, y2);

        // Add the markers if necessary.
        if(this._arrowEnd) {
            this.shape.marker('end', this.markerEnd);
        }
        if(this._arrowStart) {
            this.shape.marker('start', this.markerStart);
        }
        return this;
    }

    segment(): Figure {
        this._stopP1 = true;
        this._stopP2 = true;
        this._arrowEnd = false;
        this._arrowStart = false;
        this.update();
        return this;
    }

    vector(): Figure {
        this._stopP1 = true;
        this._stopP2 = true;
        this._arrowEnd = true;
        this._arrowStart = false;
        this.update();
        return this;
    }

    halfRule(): Figure {
        this._stopP1 = true;
        this._stopP2 = false;
        this._arrowEnd = false;
        this._arrowStart = false;
        this.update();
        return this;
    }

    line(): Figure {
        this._stopP1 = false;
        this._stopP2 = false;
        this._arrowEnd = false;
        this._arrowStart = false;
        this.update();
        return this;
    }

    perpendicular(through?:string): Figure {
        // Remove the condition
        if(this._conditionRule.rule==='p'){
            this._conditionRule.rule = '';
        }

        this.line();
        this._conditionRule.rule = 'p';
        this._conditionRule.through = through===undefined?'':through;
        this._conditionRule.k = '';

        this.update();
        return this;
    }

    /* Getter and setter*/
    get p1(): string {
        return this._p1;
    }

    set p1(value: string) {
        this._p1 = value;
    }

    get p2(): string {
        return this._p2;
    }

    set p2(value: string) {
        this._p2 = value;
    }

    get stopP1(): Boolean {
        return this._stopP1;
    }

    set stopP1(value: Boolean) {
        this._stopP1 = value;
    }

    get stopP2(): Boolean {
        return this._stopP2;
    }

    set stopP2(value: Boolean) {
        this._stopP2 = value;
    }

    get arrowStart(): Boolean {
        return this._arrowStart;
    }

    set arrowStart(value: Boolean) {
        this._arrowStart = value;
    }

    get arrowEnd(): Boolean {
        return this._arrowEnd;
    }

    set arrowEnd(value: Boolean) {
        this._arrowEnd = value;
    }

    get slope():number {
        return this._slope;
    }

}