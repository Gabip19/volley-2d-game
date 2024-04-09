import { Scene } from 'phaser';
import {Player} from "../Player";

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.initialPlayerX = 200;
        this.initialPlayerY = this.cameras.main.height - 100;
        this.initialBallX = this.game.config.width / 2;
        this.initialBallY = 200;
        this.maxScore = 5;

        this.initBackground();

        this.initMiddleWall();

        this.initScore();

        this.initGround();

        this.initFirstPlayer();

        this.initSecondPlayer();

        this.initBall();

        this.initCollisions();

        this.initAnimations();
    }

    initAnimations() {
        // Standing still uses the first frame
        this.anims.create({
            key: 'redStand',
            frames: [{key: 'redPlayerSprite', frame: 0}],
            frameRate: 20,
        });

        // Running loops frames 2 and 3
        this.anims.create({
            key: 'redRun',
            frames: this.anims.generateFrameNumbers('redPlayerSprite', {start: 1, end: 2}),
            frameRate: 10,
            repeat: -1
        });

        // Jumping uses the 4th frame
        this.anims.create({
            key: 'redJump',
            frames: [{key: 'redPlayerSprite', frame: 3}],
            frameRate: 20,
        });

        this.anims.create({
            key: 'blueStand',
            frames: [{key: 'bluePlayerSprite', frame: 0}],
            frameRate: 20,
        });

        // Running loops frames 2 and 3
        this.anims.create({
            key: 'blueRun',
            frames: this.anims.generateFrameNumbers('bluePlayerSprite', {start: 1, end: 2}),
            frameRate: 10,
            repeat: -1
        });

        // Jumping uses the 4th frame
        this.anims.create({
            key: 'blueJump',
            frames: [{key: 'bluePlayerSprite', frame: 3}],
            frameRate: 20,
        });
    }

    initScore() {
        // Score variables
        this.player1Score = 0;
        this.player2Score = 0;

        // Display the scores
        this.scoreText = this.add.text(this.cameras.main.width / 2 - 70, 50, '0 - 0', {
            fontFamily: 'Consolas',
            fontSize: '50px',
            fill: '#FFF'
        });
    }

    initBackground() {
        this.cameras.main.setBackgroundColor(0x00ff00);
        const bg = this.add.image(0, 0, 'game-bg').setOrigin(0, 0);
        bg.setDisplaySize(this.scale.width, this.scale.height);
    }

    initBall() {
        // Create the ball
        this.ball = this.physics.add.sprite(this.initialBallX, this.initialBallY, 'ballAnimation');

        this.anims.create({
            key: 'spin',
            frames: this.anims.generateFrameNumbers('ballAnimation', {start: 0, end: 7}),
            frameRate: 10,
            repeat: -1
        });

        this.ball.setCollideWorldBounds(true); // Make the ball collide with the game boundaries
        this.ball.setBounce(1, 0.8);
        this.ball.body.setGravityY(300); // Adjust the gravity value as needed

        // Enable damping and set the drag value
        this.ball.body.setDamping(true);
        this.ball.body.setDrag(0.90); // A value close to 1 will slow down the ball very gradually
    }

    initMiddleWall() {
        const wallWidth = 20; // The thickness of the wall
        const wallHeight = 220; // The height of the wall, adjust as needed
        const centerX = this.cameras.main.width / 2; // Center of the screen on the X axis

        // Calculate the Y position so the bottom of the wall is at the bottom of the scene
        const bottomY = this.cameras.main.height; // Bottom of the screen on the Y axis
        const startY = bottomY - wallHeight / 2; // Y position for the wall to start from the bottom up

        // Add a static physics sprite for the wall
        // Note: 'invisible' is a placeholder; ideally, you have a transparent 1x1 px image loaded for such purposes
        this.wall = this.physics.add.staticSprite(centerX, startY, 'pole');
        this.wall.displayWidth = wallWidth;
        this.wall.displayHeight = wallHeight;
        this.wall.refreshBody(); // Refresh the physics body to match the display size
    }

    initGround() {
        // Create a ground object
        this.ground = this.physics.add.staticGroup();
        this.ground.create(this.cameras.main.width / 2, this.cameras.main.height, 'groundTexture')
            .setScale(100, 2).refreshBody().setVisible(false);

        // // Draw a colored rectangle to represent the ground visually
        let graphics = this.add.graphics();
        graphics.fillStyle(0xffe5b2, 1);
        graphics.fillRect(0, this.cameras.main.height - 31, this.cameras.main.width, 31);
    }

    initFirstPlayer() {
        this.playerOne = new Player(this, this.initialPlayerX, this.initialPlayerY, 'redPlayerSprite', 'wasd');

        this.physics.add.collider(this.playerOne, this.wall);
        this.physics.add.collider(this.playerOne, this.ground);
    }

    initSecondPlayer() {
        this.playerTwo = new Player(this, this.cameras.main.width - this.initialPlayerX, this.initialPlayerY, 'bluePlayerSprite', 'arrows');

        this.physics.add.collider(this.playerTwo, this.wall);
        this.physics.add.collider(this.playerTwo, this.ground);
    }

    initCollisions() {
        // Handle ball and player collision
        this.physics.add.collider(this.ball, this.playerOne, () => this.handlePlayerBallCollision(this.ball, this.playerOne));

        this.physics.add.collider(this.ball, this.playerTwo, () => this.handlePlayerBallCollision(this.ball, this.playerTwo));

        this.physics.add.collider(this.ball, this.ground, () => this.handleBallGroundCollision());

        this.physics.add.collider(this.ball, this.wall);
    }

    handlePlayerBallCollision(player) {
        if (this.ball.body.velocity.x < 50 && this.ball.body.velocity.x > -50) {
            this.ball.body.velocity.x = 100;
        }

        if (player.body.velocity.x > 0) {
            this.ball.body.velocity.x = Math.abs(this.ball.body.velocity.x) * 1.3;
        } else if (player.body.velocity.x < 0) {
            this.ball.body.velocity.x = -Math.abs(this.ball.body.velocity.x) * 1.3;
        }

        this.ball.body.velocity.y -= 200;
    }

    handleBallGroundCollision() {
        if (this.ball.x < this.wall.x) {
            // Ball is on the left side
            this.player2Score++;
        } else {
            // Ball is on the right side
            this.player1Score++;
        }

        // Check if either player has reached a score of 5
        if (this.player1Score >= this.maxScore || this.player2Score >= this.maxScore) {
            // Determine the winner
            const winner = this.player1Score >= this.player2Score ? 'Player 1 Wins' : 'Player 2 Wins';

            // Transition to the Game Over scene
            this.scene.start('GameOver', { winner });
        }

        this.scoreText.setText(`${this.player1Score} - ${this.player2Score}`);

        // Reset ball and players
        this.resetGame();
    }

    resetGame() {
        this.playerOne.x = this.initialPlayerX;
        this.playerOne.y = this.initialPlayerY;

        this.playerTwo.x = this.cameras.main.width - this.initialPlayerX;
        this.playerTwo.y = this.initialPlayerY;

        this.ball.x = this.initialBallX;
        this.ball.y = this.initialBallY;
        this.ball.setVelocityX(0);
        this.ball.setVelocityY(0);
    }

    updateBallSpin() {
        const updateBallSpin = () => {
            let speed = Math.abs(this.ball.body.velocity.x);

            // Adjust the frame rate of the animation based on the ball's speed
            let frameRate = Math.floor(Phaser.Math.Clamp(speed / 14, 1, 30)); // Clamp between 10 and 60 frames per second

            // If the animation is already playing, update its frame rate
            if (this.ball.anims.isPlaying) {
                this.ball.anims.msPerFrame = 1000 / frameRate;
            }
        }

        if (Math.abs(this.ball.body.velocity.x) > 20) {
            if (!this.ball.anims.isPlaying) {
                this.ball.play('spin');
            }
            updateBallSpin();
        } else {
            this.ball.anims.stop();
        }
    }

    update(time, delta) {
        // console.log(this.ball.body.velocity.x);

        this.playerOne.update();
        this.playerTwo.update();
        this.updateBallSpin();
    }
}
