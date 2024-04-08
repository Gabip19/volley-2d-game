import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y) {
        super(scene, x, y, 'playerTexture'); // 'playerTexture' is a placeholder for your player's texture
        this.scene = scene;

        // Initialize the player's properties
        this.scene.physics.world.enable(this);
        this.scene.add.existing(this);

        // Set player's properties
        this.setCollideWorldBounds(true); // Prevent the player from moving out of the game's world
        this.body.setSize(60, 110); // Set the size of the player's physics body if needed

        // Apply gravity to the player
        this.setGravityY(1500); // Adjust the value to change the gravity strength

        // Player's movement properties
        this.cursors = this.scene.input.keyboard.createCursorKeys();
    }

    update(args) {
        const deceleration = this.body.touching.down ? 20 : 10; // Adjust this value to control how quickly the player slows down

        // Left and right movement
        if (this.cursors.left.isDown) {
            this.body.setVelocityX(-450);
        } else if (this.cursors.right.isDown) {
            this.body.setVelocityX(450);
        } else {
            // Apply deceleration when no keys are pressed
            if (this.body.velocity.x > 0) { // Moving right
                this.body.setVelocityX(Math.max(this.body.velocity.x - deceleration, 0));
            } else if (this.body.velocity.x < 0) { // Moving left
                this.body.setVelocityX(Math.min(this.body.velocity.x + deceleration, 0));
            }
        }

        // Jumping
        if (this.cursors.up.isDown && this.body.touching.down) {
            this.body.setVelocityY(-750); // Adjust the jump height as needed
        }
    }
}
