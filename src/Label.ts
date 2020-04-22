import {Text} from "@svgdotjs/svg.js";
import {GeometryPi} from "./GeometryPi";

export class Label{
    private _geometryPi: GeometryPi;
    private _name: string;
    private _position: {horizontal: string, vertical: string}
    private _offset: {dx: number, dy: number}
    private _distance: number;
    private _shape: Text;
    private _x: number;
    private _y: number;
    constructor(gPi:GeometryPi, text:string) {
        this._geometryPi = gPi
        this._name = text;
        this._position = {
            horizontal: 'left',
            vertical: 'bottom'
        };
        this._offset = {
            dx: 0,
            dy: 0
        };
        this._distance = 15;

        this._shape = this._geometryPi.draw.text('');
        this._shape.leading(0.0);

        this._shape.font({
            size: '200%'
        });
        this._updateText();
        return this;
    }

    private _updateText(){
        let index;

        if (this._name.match(/\d+/g)===null) {
            this._shape.text(this._name);
        } else {
            // There are indices - make them as indices!
            let text = this._name,
                dy = 5,
                posIndices = false;
            this._shape.text(function (add) {
                for (let t of text) {
                    if (isNaN(Number(t))) {
                        add.tspan(t).dy(posIndices ? -dy : 0);
                        posIndices = false;
                    } else {
                        add.tspan(t).dy(posIndices ? 0 : dy).font('size', '150%').font('anchor', 'middle')
                        posIndices = true;
                    }
                }
            });
        }
    }
    move(x:number, y:number):Label{
        this._x = x;
        this._y = y;

        // Reference point.
        let posX = +x, posY = +y;

        // Add spaces between the reference point and the anchor.
        if(this._position.horizontal==='left'){
            posX = posX - this.w/2 - this._distance ;
        }else if(this._position.horizontal==='right'){
            posX = posX + this.w/2 + this._distance;
        }

        if(this._position.vertical==='top'){
            posY = posY - this.h/2 - this._distance;
        }else if(this._position.vertical==='bottom'){
            posY = posY + this.h/2 + this._distance;
        }

        // Modify the position.
        posX += this._offset.dx;
        posY += this._offset.dy;

        this.shape.cx(posX).cy(posY);
        return this;
    }

    show():Label {
        this.shape.show();
        return this;
    }
    hide(): Label {
        this.shape.hide();
        return this;
    }

    top():Label {
        this._position.vertical = 'top';
        this.move(this._x, this._y);
        return this;
    }
    bottom():Label {
        this._position.vertical = 'bottom';
        this.move(this._x, this._y);
        return this;
    }
    center():Label {
        this._position.vertical = 'center';
        this.move(this._x, this._y);
        return this;
    }
    left():Label {
        this._position.horizontal = 'left';
        this.move(this._x, this._y);
        return this;
    }
    right():Label {
        this._position.horizontal = 'right';
        this.move(this._x, this._y);
        return this;
    }
    middle():Label {
        this._position.horizontal = 'middle';
        this.move(this._x, this._y);
        return this;
    }
    distance(value: number):Label {
        this._distance = value;
        return this;
    }

    get shape(): Text {
        return this._shape;
    }

    get w(): number {
        return this.shape.length();
    }

    get h(): number {
        return this.shape.bbox().h;
    }
}