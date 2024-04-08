import Phaser from 'phaser';

export class RemotePlayer extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, id, x, y) {
        super(scene, x, y, 'playerTexture'); // 'playerTexture' is a placeholder for your player's texture
        this.scene = scene;
        this.id = id;

        // Initialize the player's properties
        this.scene.add.existing(this);

        // Set player's properties
        // this.body.setSize(50, 50); // Set the size of the player's physics body if needed
    }

    update(args) {
        this.x = args.x;
        this.y = args.y;
    }
}
