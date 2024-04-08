import { Scene } from 'phaser';

export class GameOver extends Scene
{
    constructor ()
    {
        super('GameOver');
    }

    init(data) {
        this.winner = data.winner;
    }

    create ()
    {
        this.cameras.main.setBackgroundColor(0xff0000);

        this.add.image(512, 384, 'background').setAlpha(0.5);

        this.add.text(this.scale.width / 2, this.scale.height / 2, 'Game Over', {
            fontFamily: 'Arial Black', fontSize: 64, color: '#ffffff',
            stroke: '#000000', strokeThickness: 8,
            align: 'center'
        }).setOrigin(0.5);

        // Display the winner
        this.add.text(this.scale.width / 2, this.scale.height / 2 + 50, this.winner, {
            fontSize: '32px',
            fontFamily: 'Consolas',
            fill: '#FFF',
            stroke: '#000000',
            strokeThickness: 5,
        }).setOrigin(0.5, 0.5);

        // Optionally, add instructions to restart or go back to the main menu
        this.add.text(this.scale.width / 2, this.scale.height / 2 + 100, 'Press Space to return to Menu', {
            fontSize: '20px',
            fill: '#FFF',
            fontFamily: 'Consolas'
        }).setOrigin(0.5, 0.5);

        this.input.keyboard.once('keydown-SPACE', () => {
            this.scene.start('MainMenu');
        });
    }
}
