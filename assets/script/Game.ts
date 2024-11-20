import { _decorator, Component, Node } from 'cc';
import { GamepadManager } from './GamepadManager';
const { ccclass, property } = _decorator;

@ccclass('Game')
export class Game extends Component {

    protected start() {
        GamepadManager.instance.create();
    }

    protected update(deltaTime: number) {

    }

    protected onDestroy(): void {
        GamepadManager.instance.destroy();
    }
}
