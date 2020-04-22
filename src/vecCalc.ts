import {IPoint} from "./GeometryPi";

export class vecCalc {
    constructor() {
    }

    static distance(p1:IPoint, p2:IPoint):number {
        return Math.sqrt(
            Math.pow(p2.x-p1.x, 2) +
            Math.pow(p2.y-p1.y, 2)
        );
    }

    static midPoint(p1: IPoint, p2: IPoint):IPoint {
        return {
            x: (p1.x+p2.x)/2,
            y: (p1.y+p2.y)/2
        };
    }
}