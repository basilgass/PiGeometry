import {GeometryPi} from "./GeometryPi";
import {Line} from "./figures/Line";
import {Point} from "./figures/Point";
import {Grid} from "./Grid";
import {Figure} from "./figures/Figure";

export class Axis{
    private _geometryPi: GeometryPi;
    private _grid: Grid;
    private _xAxis: Figure;
    private _yAxis: Figure;
    private _origin: Point;

    constructor(gPi:GeometryPi) {
        this._geometryPi = gPi;
        this._grid = gPi.mainGrid;

        this._geometryPi.addPoint('OxMin', this._grid.minX+0.5, 0).setVirtual();
        this._geometryPi.addPoint('OxMax', this._grid.maxX-0.5, 0).setVirtual();
        this._geometryPi.addPoint('OyMin', 0, this._grid.minY+0.5).setVirtual();
        this._geometryPi.addPoint('OyMax', 0, this._grid.maxY-0.5).setVirtual();

        this._xAxis = this._geometryPi.vector('OxMin', 'OxMax');
        this._yAxis = this._geometryPi.vector('OyMin', 'OyMax');

        return this;
    }

    show():Axis{
        this._xAxis.show(false);
        this._yAxis.show(false);
        return this;
    }
}