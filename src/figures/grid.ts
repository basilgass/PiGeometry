import {GeometryPi, IPoint} from "../GeometryPi";
import {G, Line, Path, Polygon, Svg} from "@svgdotjs/svg.js";


export class Grid {
    private _geometryPi: GeometryPi;
    private _intersections: IPoint[];
    private _group: G;
    private _intersectionsPoints: G;
    private _gridData: {width: number, height: number, type: number};

    constructor(gPi: GeometryPi) {
        this._geometryPi = gPi;
        this._group = this._geometryPi.draw.group();
        this._gridData = {
            width: 0,
            height: 0,
            type: 0
        };

        return this;
    };

    /**
     * Grid styles
     */

    triangle = (triangleWidth: number): Grid => {
        let w = this._geometryPi.width,
            h = this._geometryPi.height,
            dh = triangleWidth*Math.sin(Math.PI/3),
            row = 0;

        this._gridData.type = 3;
        this._gridData.width = +triangleWidth;
        this._gridData.height = +dh;

        this._intersections = [];

        for(let posX=-triangleWidth; posX<w; posX += triangleWidth){
            row = 0;
            for(let posY=h; posY>=-dh; posY -= dh){
                this._group.add(this._geometryPi.draw.polygon(
                    [
                        posX+(row%2)*triangleWidth/2, posY,
                        posX+triangleWidth+(row%2)*triangleWidth/2, posY,
                        posX+triangleWidth/2+(row%2)*triangleWidth/2, posY+dh
                    ]
                ));
                this._intersections.push({x: posX+(row%2)*triangleWidth/2, y:posY});
                this._intersections.push({x: posX+triangleWidth+(row%2)*triangleWidth/2, y:posY});
                row++;
            }
        }

        this._group.stroke({color: 'green', width: 1}).fill('transparent');
        return this;
    };

    hexagonal = (hexWidth: number,): Grid => {
        let w = this._geometryPi.width,
            h = this._geometryPi.height,
            dx = hexWidth*0.5,
            dy = hexWidth*Math.sin(Math.PI/3);

        this._gridData.type = 6;
        this._gridData.width = +hexWidth;

        this._intersections = [];

        for(let posX=0; posX<w; posX += hexWidth*3){
            for(let posY=h; posY>=-dy; posY -= dy*2){
                this._group.add(this._geometryPi.draw.line(posX, posY, posX+hexWidth, posY));
                this._group.add(this._geometryPi.draw.line(posX, posY, posX-dx, posY-dy));
                this._group.add(this._geometryPi.draw.line(posX-dx, posY-dy, posX, posY-2*dy));
                this._group.add(this._geometryPi.draw.line(posX+hexWidth, posY, posX+hexWidth+dx, posY-dy));
                this._group.add(this._geometryPi.draw.line(posX+hexWidth+dx, posY-dy, posX+hexWidth, posY-2*dy));
                this._group.add(this._geometryPi.draw.line(posX+hexWidth+dx, posY-dy, posX+2*hexWidth+dx, posY-dy));

                this._intersections.push({x: posX, y: posY});
                this._intersections.push({x: posX+hexWidth, y: posY});
                this._intersections.push({x: posX+hexWidth+dx, y: posY-dy});
                this._intersections.push({x: posX+hexWidth, y: posY-2*dy});
                this._intersections.push({x: posX, y: posY-2*dy});
                this._intersections.push({x: posX-dx, y: posY-dy});
            }
        }

        this._group.stroke({color: 'green', width: 1}).fill('transparent');
        return this;
    };

    orthographic = (x: number, y?:number):Grid => {
        let w = this._geometryPi.width,
            h = this._geometryPi.height,
            line: Line;
        if(y===undefined){y = +x;}

        this._gridData.type = 4;
        this._gridData.width = +x;
        this._gridData.height = +y;

        for(let pos = 0; pos<=w; pos+=x){
            this._group.add(this._geometryPi.draw.line(pos, 0, pos, h));
        }

        for(let pos = h; pos>=0; pos-=y){
            this._group.add(this._geometryPi.draw.line(0, pos, w, pos));
        }

        // Calculate all interections points.
        this._intersections = [];
        for(let xPos = 0; xPos<=w; xPos+=x){
            for(let yPos = h; yPos>=0; yPos-=y){
                this._intersections.push({
                    x: xPos,
                    y: yPos
                });
            }
        }

        this._group.stroke({color: 'red', width: 1});
        return this;
    };

    /**
     * Coordinate functions
     */
    getOrigin = ():IPoint => {
        return {x: 0, y: this._geometryPi.height};
    };

    getPoint = (direction:IPoint, origin?: IPoint):IPoint => {
        let pt:IPoint;
        if(origin===undefined){origin = this.getOrigin();}

        if(this._gridData.type===3){return this._getPointTriangle(direction, origin)}
        if(this._gridData.type===4){return this._getPointOrtho(direction, origin)}
        if(this._gridData.type===6){return this._getPointHex(direction, origin)}
        return pt;
    };

    private _getPointTriangle = (direction:IPoint, origin: IPoint):IPoint => {
        let pt: IPoint;

        return {
            x: origin.x + (direction.x*this._gridData.width) + (Math.abs(direction.y) % 2)*this._gridData.width/2,
            y: origin.y - (direction.y*this._gridData.height)
        };
    };

    private _getPointOrtho = (direction:IPoint, origin: IPoint):IPoint => {
        let pt: IPoint;

        return {
            x: origin.x + (direction.x*this._gridData.width),
            y: origin.y - (direction.y*this._gridData.height)
        };
    };

    private _getPointHex = (direction:IPoint, origin: IPoint):IPoint => {
        let pt: IPoint;

        return{
            x: origin.x + (direction.x),
            y: origin.x + (direction.x)
        };
    };

    /**
     * Intersection points functions
     */
    nearestPoint = (pt: IPoint):IPoint => {
        let minDistance:boolean|number = false,
            distance = 0,
            nearestPoint = {x: +pt.x, y: +pt.y};

        for(let test of this._intersections){
            distance = Math.pow(test.x-pt.x, 2) + Math.pow(test.y-pt.y, 2);
            if(minDistance===false || distance<minDistance){
                nearestPoint = {x: +test.x, y: +test.y};
                minDistance = +distance;
            }
        }

        //this._geometryPi.draw.circle(20).cx(nearestPoint.x).cy(nearestPoint.y);
        return nearestPoint;
    };

    showIntersections():Grid{
        this._intersectionsPoints = this._geometryPi.draw.group();
        for(let pt of this._intersections){
            this._intersectionsPoints.add(this._geometryPi.draw.circle(3).cx(pt.x).cy(pt.y));
        }
        return this;
    }

    hideIntersections():Grid{
        this._intersectionsPoints.remove();
        return this;
    }

    /**
     * Grid style options
     */
    color(value:string):Grid{
        this._group.stroke(value);
        return this;
    }

    width(value:number):Grid{
        this._group.stroke({width: value});
        return this;
    }

    dash(value: number|string):Grid{
        if(typeof value==="number"){
            this._group.stroke({'dasharray': `${value} ${value}`});
        }else{
            this._group.stroke({'dasharray': value});
        }
        return this;
    }

    /**
     * Getters and setters
     */
    get intersections():IPoint[]{
        return this._intersections;
    }

    get grid():G{
        return this._group;
    }

    set stroke(value: string){
        this._group.stroke(value);
    }

}