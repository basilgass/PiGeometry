import {GeometryPi, IPoint} from "../GeometryPi";
import {Shape} from "@svgdotjs/svg.js";

export interface IFigure {
    type: string
    data: {[key: string]: any},
    shape: Shape
}

export class Figures {
    private _geometryPi: GeometryPi;
    private _figures: IFigure[];
    private _points: {[key: string]:IPoint};
    constructor(gPi: GeometryPi) {
        this._geometryPi = gPi;
        this._figures = [];
        this._points = {};

        return this;
    }

    /* Managing the points */
    addPoint(pt:IPoint):Figures{
        if(pt.name===undefined){
            pt.name = this._pointAutoName();
        }

        this._points[pt.name] = {
            x: pt.x,
            y: pt.y,
            name: pt.name
        };

        return this;
    }

    emptyPoint():IPoint{
        return {x:0,y:0};
    }

    addDefaultPoint(name:string):Figures {
        if(!(name in this._points)){
            return this.addPoint({x: 0, y: 0, name: name});
        }
        return this;
    }

    private _pointAutoName(index?:number):string{
        let letter:string, letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

        for(let i=0; i<letters.length; i++){
            if(!((index===undefined?letters[i]:letters[i]+index) in this._points)){
                return letters[i];
            }
        }
        return this._pointAutoName(index===undefined?1:index+1);
    }

    getPoint(name: string):IPoint{
        return (name in this._points)?this._points[name]:this.emptyPoint();
    }

    /* Construction methods */
    constructionStringList():{[key: string]:string}{
        return {
            '[AB]': 'Segment AB',
            '[AB[': 'Half-rule from A through B',
            ']AB[': 'Rule throuhg A and B',
            'vAB': 'Vector AB'
        }
    }

    addFigure(str: String):Figures{
        let r:RegExpMatchArray[];

        // Line
        r = [...str.matchAll(/\]([A-Z][0-9]*)([A-Z][0-9]*)\[/g)];
        if(r.length===1){
            console.log(`A line through ${r[0][1]} and ${r[0][2]}`);
        }

        // Segment
        r = [...str.matchAll(/\[([A-Z][0-9]*)([A-Z][0-9]*)\]/g)];
        if(r.length===1){
            return this._segment(r[0]);
            console.log(`A segment from ${r[0][1]} to ${r[0][2]}`);
        }

        // Half-rule
        r = [...str.matchAll(/\[([A-Z][0-9]*)([A-Z][0-9]*)\[/g)];
        if(r.length===1){
            console.log(`A half-rule from ${r[0][1]} through ${r[0][2]}`);
        }

        // Vector
        r = [...str.matchAll(/v([A-Z][0-9]*)([A-Z][0-9]*)/g)];
        if(r.length===1){
            console.log(`A vector from ${r[0][1]} to ${r[0][2]}`);
        }

        return this;
    }

    private _checkTwoPoints(strReg:RegExpMatchArray):{p1:string,p2:string} {
        let p1 = strReg[1],
        p2 = strReg[2];

        // Check that the two points exists.
        this.addDefaultPoint(p1);
        this.addDefaultPoint(p2);
        return {p1, p2};
    }

    private _segment(strReg:RegExpMatchArray):Figures {
        let {p1, p2} = this._checkTwoPoints(strReg);

        this._figures.push({
            type: 'segment',
            data: {p1, p2},
            shape: this._geometryPi.draw.line(
                this._points[p1].x,
                this._points[p1].y,
                this._points[p2].x,
                this._points[p2].y,
            ).stroke({width: 1, color: 'black'})
        });
        return this;
    }

    private _line(strReg:RegExpMatchArray):Figures {
        let {p1, p2} = this._checkTwoPoints(strReg);

        return this;
    }

}