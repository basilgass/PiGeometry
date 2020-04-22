import {Marker, Text} from "@svgdotjs/svg.js";
import {GeometryPi} from "../GeometryPi";
import {Point} from "./Point";
import {Label} from "../Label";

export class Figure {
    private _name: string;
    private _shape: any;
    private _geometryPi: GeometryPi;
    private _marker: { [key: string]: Marker };
    private _label: Label;
    private _isPoint: Boolean;
    private _isVirtual: Boolean;

    constructor(geom: GeometryPi, name: string) {
        this._geometryPi = geom;
        this._name = name;

        // Create the label and hide it be default
        this._label = new Label(this._geometryPi, this.name).hide();
        this._createMarker(10);
        this._isPoint = false;
        this._isVirtual = false;

        return this;
    }

    private _createMarker(scale: number) {
        this._marker = {
            start: null,
            end: null
        };

        this._marker.start = this.geometryPi.draw.marker(
            scale,
            scale,
            function (add) {
                add.path(`M1,0 L1,${scale}, L${scale * 1.2},${scale / 2} L1,0z`)
            }).ref(scale, scale / 2);
        this._marker.end = this.geometryPi.draw.marker(
            scale,
            scale,
            function (add) {
                add.path(`M1,0 L1,${scale}, L${scale * 1.2},${scale / 2} L1,0z`)
            }).ref(scale, scale / 2);
    }

    draggable(): Figure {
        return this;
    }

    update(): Figure {
        this.moveLabel();
        return this;
    }

    distance(A: string, B: string): number {
        let p1 = this.geometryPi.getPoint(A),
            p2 = this.geometryPi.getPoint(B);

        return this.distanceTwoPoints(p1, p2);
    }

    distanceTwoPoints(p1: Point, p2: Point) {
        if (p1 === null || p2 === null) {
            return 0;
        }
        return Math.sqrt(
            Math.pow(p2.x - p1.x, 2) +
            Math.pow(p2.y - p1.y, 2)
        );
    }

    makeDraggable(): Figure {
        return this;
    }

    moveLabel(): Figure {
        // Must be overriden depending on the children.
        if (this._label === null) {
            return this;
        }
        return this;
    }

    show(showLabel?: Boolean): Figure {
        this.shape.show();

        if (showLabel !== false) {
            this.showLabel();
        }
        return this;
    }

    hide(): Figure {
        this.shape.hide();
        this.hideLabel();
        return this;
    }

    showLabel(): Figure {
        if (this.isVirtual) {
            return this;
        }
        this.label.show();

        this.moveLabel();
        return this;
    }

    hideLabel(): Figure {
        if (this._label !== null) {
            this._label.hide();
        }
        return this;
    }

    labelTop():Figure {
        this._label.top();
        return this;
    }
    labelBottom():Figure {
        this._label.bottom();
        return this;
    }
    labelCenter():Figure {
        this._label.center();
        return this;
    }
    labelLeft():Figure {
        this._label.left();
        return this;
    }
    labelRight():Figure {
        this._label.right();
        return this;
    }
    labelMiddle():Figure {
        this._label.middle();
        return this;
    }
    labelDistance(value:number):Figure {
        this._label.distance(value);
        return this;
    }

    setVirtual(value?: Boolean): Figure {
        this.isVirtual = value === undefined || value === true;
        if (this.isVirtual) {
            this.hide();
        } else {
            this.show();
        }
        return this;
    }

    /**
     * Visual style options
     */
    color(value: string): Figure {
        this.shape.stroke(value);
        return this;
    }

    width(value: number): Figure {
        this.shape.stroke({width: value});
        return this;
    }

    dash(value: number | string): Figure {
        if (typeof value === "number") {
            this.shape.stroke({'dasharray': `${value} ${value}`});
        } else {
            this.shape.stroke({'dasharray': value});
        }
        return this;
    }

    nofill(): Figure {
        this.shape.fill('None');
        return this;
    }

    fill(value: string): Figure {
        this.shape.fill(value)
        return this;
    }

    /**
     * Getter and setter
     */

    get geometryPi(): GeometryPi {
        return this._geometryPi;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    get shape(): any {
        return this._shape;
    }

    set shape(value: any) {
        this._shape = value;
    }

    get markerEnd(): Marker {
        return this._marker.end;
    }

    get markerStart(): Marker {
        return this._marker.start;
    }

    get label(): Label {
        return this._label;
    }

    get isPoint(): Boolean {
        return this._isPoint;
    }

    set isPoint(value: Boolean) {
        this._isPoint = value;
    }

    get isVirtual(): Boolean {
        return this._isVirtual;
    }

    set isVirtual(value: Boolean) {
        this._isVirtual = value;
    }
}