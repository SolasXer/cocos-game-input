import { _decorator, Component, director, Node } from "cc";
const { ccclass, property } = _decorator;

export enum EGamepadKey {
    A = 0,
    B = 1,
    X = 2,
    Y = 3,
    L1 = 4,
    R1 = 5,
    L2 = 6,
    R2 = 7,
    SELECT = 8,
    START = 9,
    LS = 10,
    RS = 11,
    UP = 12,
    DOWN = 13,
    LEFT = 14,
    RIGHT = 15,
}

export enum EGamepadKeyState {
    KEY_DOWN,
    KEY_UP,
}

export type TGamepadButtonListener = (button: EGamepadKey, state: EGamepadKeyState, value: number) => void;
export type TGamepadAxeListener = (lx: number, ly: number, rx: number, ry: number) => void;

type TGamepadButtonState = { useValue: boolean, pressed: boolean };

const GamepadExEvent = {
    CONNECTED: 'gamepadconnected',
    DISCONNECTED: 'gamepaddisconnected',
}

const GamepadKeyList = [
    EGamepadKey.A,
    EGamepadKey.B,
    EGamepadKey.X,
    EGamepadKey.Y,
    EGamepadKey.L1,
    EGamepadKey.R1,
    EGamepadKey.L2,
    EGamepadKey.R2,
    EGamepadKey.SELECT,
    EGamepadKey.START,
    EGamepadKey.LS,
    EGamepadKey.RS,
    EGamepadKey.UP,
    EGamepadKey.DOWN,
    EGamepadKey.LEFT,
    EGamepadKey.RIGHT,
]

@ccclass('GamepadComp')
class GamepadComp extends Component {
    private _onConnected: any;
    private _onDisconnected: any;
    private _isConnected: boolean = false;
    private _buttonListeners: [TGamepadButtonListener, any][] = [];
    private _axeListeners: [TGamepadAxeListener, any][] = [];

    private _buttonStates = {
        [EGamepadKey.A]: { useValue: false, pressed: false },
        [EGamepadKey.B]: { useValue: false, pressed: false },
        [EGamepadKey.X]: { useValue: false, pressed: false },
        [EGamepadKey.Y]: { useValue: false, pressed: false },
        [EGamepadKey.L1]: { useValue: false, pressed: false },
        [EGamepadKey.R1]: { useValue: false, pressed: false },
        [EGamepadKey.L2]: { useValue: true, pressed: false },
        [EGamepadKey.R2]: { useValue: true, pressed: false },
        [EGamepadKey.SELECT]: { useValue: false, pressed: false },
        [EGamepadKey.START]: { useValue: false, pressed: false },
        [EGamepadKey.LS]: { useValue: false, pressed: false },
        [EGamepadKey.RS]: { useValue: false, pressed: false },
        [EGamepadKey.UP]: { useValue: false, pressed: false },
        [EGamepadKey.DOWN]: { useValue: false, pressed: false },
        [EGamepadKey.LEFT]: { useValue: false, pressed: false },
        [EGamepadKey.RIGHT]: { useValue: false, pressed: false },
    }

    private _axeStates: [number, number, number, number] = [0, 0, 0, 0];

    addButtonListener(listener: TGamepadButtonListener, target?: any) {
        const index = this._buttonListeners.findIndex(e => e[0] === listener && e[1] === target);
        if (index > -1) {
            return;
        }

        this._buttonListeners.push([listener, target])
    }

    removeButtonListener(listener: TGamepadButtonListener, target?: any) {
        const index = this._buttonListeners.findIndex(e => e[0] === listener && e[1] === target);
        if (index > -1) {
            this._buttonListeners.splice(index, 1);
        }
    }

    addAxeListener(listener: TGamepadAxeListener, target?: any) {
        const index = this._axeListeners.findIndex(e => e[0] === listener && e[1] === target);
        if (index > -1) {
            return;
        }

        this._axeListeners.push([listener, target])
    }

    removeAxeListener(listener: TGamepadAxeListener, target?: any) {
        const index = this._axeListeners.findIndex(e => e[0] === listener && e[1] === target);
        if (index > -1) {
            this._axeListeners.splice(index, 1);
        }
    }

    protected start(): void {
        this._onConnected = this.onConnected.bind(this);
        this._onDisconnected = this.onDisconnected.bind(this);
        window.addEventListener(GamepadExEvent.CONNECTED, this._onConnected);
        window.addEventListener(GamepadExEvent.DISCONNECTED, this._onDisconnected);
    }

    protected update(dt: number): void {
        this.checkState();
    }

    protected onDestroy(): void {
        window.removeEventListener(GamepadExEvent.CONNECTED, this._onConnected);
        window.removeEventListener(GamepadExEvent.DISCONNECTED, this._onDisconnected);
    }

    private onConnected(e: GamepadEvent) {
        console.log('Gamepad is connected:',
            `Button Count:${e.gamepad.buttons.length}`,
            `Axe Count: ${e.gamepad.axes.length}`
        );
        this._isConnected = true;
    }

    private onDisconnected(e: GamepadEvent) {
        console.warn('Oops! Gamepad disconnected!');
        this._isConnected = false;
    }

    private checkState() {
        if (!this._isConnected) {
            return;
        }

        const gamepads = navigator.getGamepads();
        if (!gamepads || gamepads.length <= 0) {
            return;
        }

        const buttons = gamepads[0].buttons;
        for (let i = 0; i < buttons.length; i++) {
            if (i > GamepadKeyList.length - 1) {
                break;
            }

            const key = GamepadKeyList[i];
            const state = this._buttonStates[key] as TGamepadButtonState;

            if (buttons[i].pressed) {
                if (!state.pressed) {
                    state.pressed = true;
                    this._buttonListeners.forEach(e => e[0]?.call(e[1], key, EGamepadKeyState.KEY_DOWN, 1.0));
                    // console.log('Button down:', EGamepadKey[key]);
                } else {
                    if (state.useValue) {
                        this._buttonListeners.forEach(e => e[0]?.call(e[1], key, EGamepadKeyState.KEY_DOWN, buttons[i].value));
                    }
                }
            } else {
                if (state.pressed) {
                    state.pressed = false;
                    this._buttonListeners.forEach(e => e[0]?.call(e[1], key, EGamepadKeyState.KEY_UP, 0));
                    // console.log('Button up:', EGamepadKey[key]);
                }
            }
        }

        const axes = gamepads[0].axes;
        if (!axes || axes.length !== 4) {
            return;
        }

        if (this._axeStates[0] !== axes[0] ||
            this._axeStates[1] !== axes[1] ||
            this._axeStates[2] !== axes[2] ||
            this._axeStates[3] !== axes[3]) {
            this._axeStates[0] = axes[0];
            this._axeStates[1] = axes[1];
            this._axeStates[2] = axes[2];
            this._axeStates[3] = axes[3];
            this._axeListeners.forEach(e => e[0]?.call(e[1], axes[0], axes[1], axes[2], axes[3]));
        }
    }
}

export class GamepadManager {
    private static _instance: GamepadManager;

    static get instance() {
        return this._instance ? this._instance : (this._instance = new GamepadManager());
    }

    private _gamepadCom: GamepadComp;

    private constructor() {

    }

    create() {
        if (this._gamepadCom && director.getScene().getChildByUuid(this._gamepadCom.node.uuid)) {
            return;
        }

        const node = new Node('gamepad-manager-1.0.0');
        this._gamepadCom = node.addComponent(GamepadComp);

        director.getScene().addChild(node);
        director.addPersistRootNode(node);
    }

    destroy() {
        director.removePersistRootNode(this._gamepadCom?.node);
        this._gamepadCom?.node.destroy();
    }

    addButtonListener(listener: TGamepadButtonListener, target?: any) {
        this._gamepadCom?.addButtonListener(listener, target);
    }

    removeButtonListener(listener: TGamepadButtonListener, target?: any) {
        this._gamepadCom?.addButtonListener(listener, target);
    }

    /**
     * lx: left to right [-1, 1]
     * ly: top to bottom [-1, 1]
     * rx: left to right [-1, 1]
     * ry: top to bottom [-1, 1]
     * @param listener (lx: number, ly: number, rx: number, ry: number) => void
     * @param target any
     */
    addAxeListener(listener: TGamepadAxeListener, target?: any) {
        this._gamepadCom?.addAxeListener(listener, target);
    }

    removeAxeListener(listener: TGamepadAxeListener, target?: any) {
        this._gamepadCom?.addAxeListener(listener, target);
    }
}