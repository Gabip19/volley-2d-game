import { Scene } from 'phaser';
import {Player} from "../Player";
import {RemotePlayer} from "../RemotePlayer";

export class Game extends Scene
{
    constructor ()
    {
        super('Game');
    }

    create ()
    {
        this.initSocketActions();

        // // Example of receiving data
        // this.socket.on('playerMoved', (coords) => {
        //     // Handle the movement of other players
        // });

        // Additional game setup...

        this.cameras.main.setBackgroundColor(0x00ff00);
        const bg = this.add.image(0, 0, 'game-bg').setOrigin(0, 0);
        bg.setDisplaySize(this.scale.width, this.scale.height);

        this.gameStarted = false;

        this.initMiddleWall();

        this.initGround();

        this.initCurrentPlayer();

        this.initBall();

        // Handle ball and player collision
        this.physics.add.collider(this.ball, this.player, (ball, player) => {
            if (player.body.velocity.x > 0) {
                ball.body.velocity.x *= 1.3;
            }

            if (player.body.velocity.y > 0) {
                ball.body.velocity.y *= 1.4;
            }
        });

        this.physics.add.collider(this.ball, this.ground);

        // Listen for ball state updates from the server
        this.socket.on('updateBall', (ballState) => {
            // Update ball position and velocity based on server update
            this.ball.setPosition(ballState.x, ballState.y);
            this.ball.setVelocity(ballState.vx, ballState.vy);
        });

        // this.input.once('pointerdown', () => {
        //     // this.scene.start('GameOver');
        // });

        // Standing still uses the first frame
        this.anims.create({
            key: 'stand',
            frames: [{ key: 'redPlayerSprite', frame: 0 }],
            frameRate: 20,
        });

        // Running loops frames 2 and 3
        this.anims.create({
            key: 'run',
            frames: this.anims.generateFrameNumbers('redPlayerSprite', { start: 1, end: 2 }),
            frameRate: 10,
            repeat: -1
        });

        // Jumping uses the 4th frame
        this.anims.create({
            key: 'jump',
            frames: [{ key: 'redPlayerSprite', frame: 3 }],
            frameRate: 20,
        });
    }

    initBall() {
        // Create the ball
        this.ball = this.physics.add.sprite(400, 300, 'ballAnimation');

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
        this.ball.body.setDrag(0.80); // A value close to 1 will slow down the ball very gradually
    }

    initSocketActions() {
        this.socket = io('http://localhost:3031'); // Adjust the URL to your server
        console.log(this.socket);

        this.socket.on('playersConnected', (players) => {
            console.log(players);
            console.log(this.socket.id);

            let currentPlayer = players.findIndex(player => player.id === this.socket.id);
            console.log(players[currentPlayer]);

            this.player.x = players[currentPlayer].x;
            this.player.y = players[currentPlayer].y;

            let remotePlayerIndex = (currentPlayer + 1) % 2;
            this.remotePlayer = new RemotePlayer(this, players[remotePlayerIndex].x, players[remotePlayerIndex].y);

            this.gameStarted = true;
        });

        this.socket.on('opponentMoved', (player) => {
            this.remotePlayer.update({x: player.x, y: player.y});
        })

        this.socket.on('opponentLeft', () => {
            console.log('Your opponent has left the game.');
            // Handle the opponent leaving (e.g., end the game, show a message)
        });
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
        this.wall = this.physics.add.staticSprite(centerX, startY, 'invisible');
        this.wall.displayWidth = wallWidth;
        this.wall.displayHeight = wallHeight;
        this.wall.refreshBody(); // Refresh the physics body to match the display size

        // Optionally, if you want to visually debug the wall's position without an actual image
        let graphics = this.add.graphics();
        graphics.lineStyle(2, 0xff0000, 1.0); // Red outline for visibility
        graphics.strokeRect(centerX - wallWidth / 2, startY - wallHeight / 2, wallWidth, wallHeight);
    }

    initGround() {
        // Create a ground object
        this.ground = this.physics.add.staticGroup();
        this.ground.create(this.cameras.main.width / 2, this.cameras.main.height, 'groundTexture').setScale(100, 2).refreshBody();
    }

    initCurrentPlayer() {
        this.player = new Player(this, 100, this.cameras.main.height - 150); // Adjust starting position as needed

        // If you have a wall or platforms, make sure to add collision
        // For example, if you have a wall variable defined
        this.physics.add.collider(this.player, this.wall);
        this.physics.add.collider(this.player, this.ground);
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
        let x = this.player.x;
        let y = this.player.y;

        // console.log(`${this.ball.body.velocity.x} - ${this.ball.body.velocity.y}`);

        if (this.gameStarted) {
            this.socket.emit('updatePosition', {x, y});
        }

        this.player.update();
        this.updateBallSpin();
    }
}
