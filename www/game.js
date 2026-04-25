// P 大叔专属打砖块游戏 - 极简版

class MainScene extends Phaser.Scene {
    constructor() {
        super({ key: 'MainScene' });
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.gameStarted = false;
    }

    preload() {
        // 创建简单的纹理
        const graphics = this.make.graphics({ x: 0, y: 0, add: false });
        
        // 创建挡板纹理 (绿色)
        graphics.fillStyle(0x00ff00, 1);
        graphics.fillRect(0, 0, 100, 15);
        graphics.generateTexture('paddle', 100, 15);
        
        // 创建球纹理 (白色)
        graphics.clear();
        graphics.fillStyle(0xffffff, 1);
        graphics.fillCircle(8, 8, 8);
        graphics.generateTexture('ball', 16, 16);
        
        // 创建砖块纹理 (红色)
        graphics.clear();
        graphics.fillStyle(0xff0000, 1);
        graphics.fillRect(0, 0, 70, 25);
        graphics.generateTexture('brick', 70, 25);
    }

    create() {
        console.log('MainScene created!');
        
        // 游戏背景
        this.add.rectangle(400, 300, 800, 600, 0x222222);
        
        // 创建挡板
        this.paddle = this.physics.add.sprite(400, 550, 'paddle');
        this.paddle.setCollideWorldBounds(true);
        
        // 创建球
        this.ball = this.physics.add.sprite(400, 400, 'ball');
        this.ball.setBounce(1);
        this.ball.setCollideWorldBounds(true);
        
        // 创建砖块 (5 行 10 列)
        this.bricks = this.physics.add.staticGroup();
        const rows = 5;
        const cols = 10;
        const brickWidth = 70;
        const brickHeight = 25;
        const padding = 5;
        const startX = (800 - (cols * (brickWidth + padding))) / 2;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                const x = startX + col * (brickWidth + padding);
                const y = 50 + row * (brickHeight + padding);
                const brick = this.bricks.create(x, y, 'brick');
                brick.setImmovable(true);
                brick.setBounce(0);
            }
        }
        
        // 碰撞检测
        this.physics.add.collider(this.ball, this.bricks, this.hitBrick, null, this);
        this.physics.add.collider(this.ball, this.paddle, this.hitPaddle, null, this);
        
        // 显示分数和生命
        this.scoreText = this.add.text(20, 20, '分数：0', { 
            fontSize: '20px', 
            fill: '#ffffff',
            fontStyle: 'bold'
        });
        
        this.livesText = this.add.text(20, 50, '生命：3', { 
            fontSize: '20px', 
            fill: '#ffffff',
            fontStyle: 'bold'
        });
        
        // 开始提示
        this.startText = this.add.text(400, 300, '点击屏幕开始游戏', { 
            fontSize: '28px', 
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);
        
        // 触摸控制
        this.input.on('pointerdown', (pointer) => {
            console.log('Pointer down at:', pointer.x, pointer.y);
            if (!this.gameStarted && !this.gameOver) {
                this.resetGame();
            }
        });
        
        // 触摸移动挡板
        this.input.on('pointermove', (pointer) => {
            if (this.gameStarted && !this.gameOver) {
                this.paddle.x = Phaser.Math.Clamp(pointer.x, 50, 750);
                console.log('Paddle moved to:', this.paddle.x);
            }
        });
    }

    update() {
        if (!this.gameStarted || this.gameOver) {
            return;
        }
        
        // 检查球是否掉出屏幕
        if (this.ball.y > 600) {
            this.lives--;
            this.livesText.setText(`生命：${this.lives}`);
            
            if (this.lives <= 0) {
                this.gameOver = true;
                this.startText.setText('游戏结束!\n点击重新开始');
                this.physics.pause();
            } else {
                this.resetBall();
            }
        }
        
        // 检查是否所有砖块都被击碎
        let remainingBricks = 0;
        this.bricks.children.iterate((brick) => {
            if (brick.active) {
                remainingBricks++;
            }
        });
        
        if (remainingBricks === 0) {
            this.gameOver = true;
            this.startText.setText('恭喜你赢了!\n点击重新开始');
            this.physics.pause();
        }
    }
    
    hitBrick(ball, brick) {
        brick.disableBody(true, true);
        this.score += 10;
        this.scoreText.setText(`分数：${this.score}`);
        ball.setVelocity(ball.body.velocity.x * 1.02, ball.body.velocity.y * 1.02);
    }
    
    hitPaddle(ball, paddle) {
        const hitPoint = ball.x - paddle.x;
        const normalizedHit = Phaser.Math.MapRange(-50, 50, -1, 1, hitPoint);
        ball.setVelocity(normalizedHit * 300, -ball.body.velocity.y);
    }
    
    resetBall() {
        this.ball.setPosition(400, 400);
        this.ball.setVelocity(200, -200);
        this.paddle.setPosition(400, 550);
    }
    
    resetGame() {
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.gameStarted = true;
        
        this.scoreText.setText(`分数：${this.score}`);
        this.livesText.setText(`生命：${this.lives}`);
        this.startText.setText('');
        
        this.resetBall();
        
        this.bricks.children.iterate((brick) => {
            brick.enableBody(true, brick.x, brick.y, true, true);
        });
        
        this.physics.resume();
    }
}

// 游戏配置
const config = {
    type: Phaser.AUTO,
    width: 800,
    height: 600,
    parent: 'game-container',
    backgroundColor: '#222222',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 0 },
            debug: false
        }
    },
    scene: MainScene
};

console.log('Creating Phaser game...');
const game = new Phaser.Game(config);
console.log('Phaser game created!');
