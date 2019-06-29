import 'phaser' from Phaser

export default class HUDScene extends Phaser.scene {
    constructor() {
        super({
            key:'HUDScene',
            active: true,
        })
    }

    init() {
        this.gameState = {
            score: 0,
        }
    }

    preload() {}

    create() {
        this.GameScene = this.scene.get('Game')

    }

    update() {}
}