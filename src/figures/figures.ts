import {GeometryPi, IPoint} from "../GeometryPi";
import {Shape} from "@svgdotjs/svg.js";

export class Figures {
    private _geometryPi: GeometryPi;
    private _figures: {data: {[key: string]: any}, shape: Shape}[];
    constructor(gPi: GeometryPi) {
        this._geometryPi = gPi;
        this._figures = [];
    }

    line(p1:IPoint, p2:IPoint):Figures {
        this._figures.push({
            data: {p1, p2},
            shape: this._geometryPi.draw.line(p1.x, p1.y, p2.x, p2.y)
        });
        return this;
    }

}