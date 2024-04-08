import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
    constructor(scene, x, y, texture, controls = 'arrows') {
        super(scene, x, y, texture);
        this.scene = scene;

        // Initialize the player's properties
        this.scene.physics.world.enable(this);
        this.scene.add.existing(this);

        // Set player's properties
        this.setCollideWorldBounds(true);
        this.body.setSize(65, 110);

        // Apply gravity to the player
        this.setGravityY(1500);

        // Player's movement properties based on the controls parameter
        if (controls === 'arrows') {
            this.cursors = this.scene.input.keyboard.createCursorKeys();
        } else if (controls === 'wasd') {
            this.cursors = this.scene.input.keyboard.addKeys({
                up: Phaser.Input.Keyboard.KeyCodes.W,
                left: Phaser.Input.Keyboard.KeyCodes.A,
                down: Phaser.Input.Keyboard.KeyCodes.S,
                right: Phaser.Input.Keyboard.KeyCodes.D
            });
        }
    }

    update(args) {
        const deceleration = this.body.touching.down ? 20 : 10; // Adjust this value to control how quickly the player slows down

        // Left and right movement
        if (this.cursors.left.isDown) {
            this.body.setVelocityX(-450);
            this.anims.play('run', true);
        } else if (this.cursors.right.isDown) {
            this.body.setVelocityX(450);
            this.anims.play('run', true);
        } else {
            // Apply deceleration when no keys are pressed
            if (this.body.velocity.x > 0) { // Moving right
                this.body.setVelocityX(Math.max(this.body.velocity.x - deceleration, 0));
            } else if (this.body.velocity.x < 0) { // Moving left
                this.body.setVelocityX(Math.min(this.body.velocity.x + deceleration, 0));
            }

            this.anims.play('stand', true);
        }

        if (!this.body.touching.down) {
            this.anims.play("jump", true);
        }

        // Jumping
        if (this.cursors.up.isDown && this.body.touching.down) {
            this.body.setVelocityY(-750); // Adjust the jump height as needed
        }
    }
}
