import { _decorator, Component, Label, Node } from 'cc';
import { EGamepadKey, EGamepadKeyState, GamepadManager } from './GamepadManager';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {
    @property(Node)
    labelMsg: Node;

    protected start() {
        GamepadManager.instance.create();

        GamepadManager.instance.addButtonListener(this.onGamepadKeyEvent, this);
        GamepadManager.instance.addAxeListener(this.onGamepadAxeEvent, this);
    }

    protected update(deltaTime: number) {

    }

    protected onDestroy(): void {
        GamepadManager.instance.removeButtonListener(this.onGamepadKeyEvent, this);
        GamepadManager.instance.removeAxeListener(this.onGamepadAxeEvent, this);
        GamepadManager.instance.destroy();
    }


    onGamepadKeyEvent(button: EGamepadKey, state: EGamepadKeyState, value: number) {
        const str = `Button ${EGamepadKey[button]} -> ${EGamepadKeyState[state]}, ${value}`;
        console.log(str);
        this.labelMsg.getComponent(Label).string = str;
    }

    onGamepadAxeEvent(lx: number, ly: number, rx: number, ry: number) {
        const str = `lx=${lx}, ly=${ly}, rx=${rx}, ry=${ry}`;
        console.log(str);
        this.labelMsg.getComponent(Label).string = str;
    }
}
