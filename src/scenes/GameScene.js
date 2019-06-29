import "phaser";
import axios from 'axios'

export default class GameScene extends Phaser.Scene {
  constructor() {
    super("Game");

  }
  init() {
    
  }

  create() {

    //-- Housekeeping --

    // -- Groups --

    //Boulder group
    this.boulders = this.physics.add.group();

    //adding world bounds as platforms
    this.bounds = this.physics.add.staticGroup();

    //Setting key values
    this.cursors = this.input.keyboard.createCursorKeys();
    this.spaceKey = this.input.keyboard.addKey( Phaser.Input.Keyboard.KeyCodes.SPACE )
    this.spaceLimit = 0;
    this.firstUpdate = 0;
    //Setting text values
  
    //adding bg tilesprites
    this.furthest = this.add.tileSprite(350, 200, 700, 400, 'furthest')
    this.far = this.add.tileSprite(350, 200, 700, 400, 'far')
    this.near = this.add.tileSprite(350, 200, 700, 400, 'near')
    this.fore = this.add.tileSprite(350, 200, 700, 400, 'fore')

    //Score text


    this.scoreText = this.add.text( 300, 25, 'Score: 0', {fontSize: '25px', fill: '#4287f5'});
    this.score = 0;

    this.events.on('updateScore', () => {
        this.score += 10;
        this.scoreText.setText(`Score: ${this.score}`);
        console.log(this.score)
    });

    this.events.on('resetScore', () => {
      this.score = 0;
      this.scoreText.setText(`Score: ${this.score}`)
    })

     //adding player sprite and adding physics
    this.player = this.physics.add.sprite(100,100,'ship');
    this.player.setCollideWorldBounds(true);
    this.player.body.onWorldBounds = true;
    this.player.setBounce(0.2);
    this.player.body.setSize(30,30)
    this.player.isAlive = true;

    //creating animations
    var flyUpAnim = this.anims.generateFrameNames('ship', {start: 1, end: 2})
    var missileAnim = this.anims.generateFrameNames('shot', {start: 0, end: 4})
    var pillarTall = this.anims.generateFrameNames('pillarTall', {start: 0, end: 6})
    var pillarTallInverted = this.anims.generateFrameNames('pillarTallInverted', {start: 0, end: 6})
    var boulderAnim = this.anims.generateFrameNames('boulder', {start: 0, end: 4})
    var coinAnim = this.anims.generateFrameNames('coin', {start: 0, end: 3})
    var boulderBreak = this.anims.generateFrameNames('boulder-break', {start: 0, end: 7})
    var gameOverAnim = this.anims.generateFrameNames('game-over', {start: 0, end: 17})
    var clickRestart = this.anims.generateFrameNames('click-restart', {start: 0, end: 4})

    this.anims.create({
      key: 'click-restart',
      frames: clickRestart,
      frameRate: 10,
      yoyo: true,
      repeat: -1
    })

    this.anims.create({
      key: 'game-over',
      frames: gameOverAnim,
      frameRate: 12,
      repeat: 0
    })

    this.anims.create({
      key: 'boulderBreak',
      frames: boulderBreak,
      frameRate: 9,
      repeat: 0
    })

    this.anims.create({
      key: 'boulderAnim',
      frames: boulderAnim,
      frameRate: 5,
      yoyo: true,
      repeat: -1,
    })

    this.anims.create({
      key:'coinAnim',
      frames: coinAnim,
      frameRate: 4,
      yoyo: true,
      repeat: -1,
    })

    this.anims.create({
      key: 'pillarTallInverted',
      frames: pillarTallInverted,
      frameRate: 4,
      repeat: -1,
    })

    this.anims.create({
      key: 'pillarTall',
      frames: pillarTall,
      frameRate: 4,
      repeat: -1
    })

    this.anims.create({
      key: 'missileShot',
      frames: missileAnim,
      frameRate: 25,
      yoyo: true,
      repeat: -1
    })
    
    this.anims.create({
      key:'explodeKey',
      frames: this.anims.generateFrameNames('explosion', {
        frames: [0,1,2,3,4,5,6,7]
      }),
      frameRate: 9,
      repeat: 0,
      hideOnComplete: true
    });

    this.anims.create({
      key:'up',
      frames: flyUpAnim,
      frameRate: 10,
      repeat: 1
    });


    
    //create top/bottom bounds
    this.bottomBound = this.bounds.create(0, 410);
    this.bottomBound.body.setSize(700, 1);
    this.bottomBound.visible = false;
    this.topBound = this.bounds.create(0, 0);
    this.topBound.body.setSize(700, 1);
    this.topBound.visible = false;

    //creating left bound to delete pillars
    this.specBound = this.physics.add.staticGroup();

    this.leftBound = this.specBound.create(-30 , 0);
    this.leftBound.body.setSize(1 , 800);
    this.leftBound.visible = true;
    
   
    //Boulder gibs
    this.gibs = this.physics.add.group();

    // Shot group 
    this.Missiles = this.physics.add.group();

    //Pillar group
    this.pillars = this.physics.add.group();

    //Coin group
    this.coins = this.physics.add.group();


    //-- Functions --

    //Firing function
    this.Missiles.shootMissile = (x,y) => {
      this.newMissile = this.physics.add.sprite( x , y , 'shot' )
      this.Missiles.add(this.newMissile)
      this.newMissile.body.enable = true;
      this.newMissile.body.setVelocityX(200)
      this.newMissile.anims.play('missileShot')
    }

    //Boulder Explosion function
    this.boulders.boulderExplode = (x,y) => {
    //explosion animation
    this.boulderExplosion = this.physics.add.sprite(x, y, 'explosion' )

      //Gibs
      for(let i = 0; i < 9; i++ ) {
        this.boulderGibs = this.physics.add.sprite(x, y, 'boulder-explosion', Phaser.Math.Between(0, 4))
        this.gibs.add(this.boulderGibs)
        this.boulderGibs.body.setVelocityX(Phaser.Math.Between(-150, 150))
        this.boulderGibs.body.setVelocityY(Phaser.Math.Between(-150, 150))
        this.boulderGibs.setRotation(Phaser.Math.Between(0, 180))

      }

      //animation
      this.boulderExplosion.body.setVelocityX(-60)
      this.boulderExplosion.body.enable = false;
      this.boulderExplosion.anims.play('boulderBreak')
      this.boulderExplosion.once('animationcomplete', () => {this.boulderExplosion.destroy()})
    }   


    //Coin spawinging function
    this.coins.spawnCoin = (x,y) => {
      this.newCoin = this.physics.add.sprite( x, y, 'coin' )
      this.coins.add(this.newCoin)
      this.newCoin.body.setSize(30,30)
      this.newCoin.anims.play('coinAnim')
    }

    //Boulder Gen Function
    function generateBoulders() {
      this.boulder = this.physics.add.sprite(700, Phaser.Math.Between(150, 250), 'boulder')
      this.boulders.add(this.boulder)
      this.boulder.anims.play('boulderAnim', true)
      this.boulder.body.setSize(40, 40)
      this.boulderGenLoop.reset({
        callback: generateBoulders,
        delay: Phaser.Math.Between(2000, 4000),
        callbackScope: this,
        loop: true,
      })
    }


    //Pillar Gen Functions
    function generateTopPillars() {
      this.topPillar = this.physics.add.sprite(700, Phaser.Math.Between(25, 75), 'pillarTallInverted')
      this.pillars.add(this.topPillar)
      this.topPillar.anims.play('pillarTallInverted', true)
      this.topPillar.body.setSize(30)
      // this.topPillar.body.immovable = true;
      this.pillarGenLoop2.reset({
        callback: generateTopPillars,
        delay: Phaser.Math.Between(700, 2000),
        callbackScope: this,
        loop: true,
      })
    }

    function generateBottomPillars() {
      this.bottomPillar = this.physics.add.sprite(700, Phaser.Math.Between(325, 400), 'pillarTall') 
      this.pillars.add(this.bottomPillar)
      this.bottomPillar.anims.play('pillarTall', true)
      this.bottomPillar.body.setSize(30)
      // this.bottomPillar.body.immovable = true;
      this.pillarGenLoop.reset({
        callback: generateBottomPillars,
        delay: Phaser.Math.Between(900, 2000),
        callbackScope: this,
        loop: true,
      })
    }

    // Boulder Gen Loop
    this.boulderGenLoop = this.time.addEvent({
      callback: generateBoulders,
      delay: Phaser.Math.Between(100, 1000),
      callbackScope: this,
      loop: true,
    })


    // Pillar Gen Loops
    this.pillarGenLoop = this.time.addEvent({
      callback: generateBottomPillars,
      delay: this.randomTimeout,
      callbackScope: this,
      loop: true,
    })

    this.pillarGenLoop2 = this.time.addEvent({
      callback: generateTopPillars,
      delay: 100,
      callbackScope: this,
      loop: true,
    })

    //-- Colliders --

    //Player pillar collision
    this.physics.add.collider(this.pillars, this.player, () => {
      if(this.player.isAlive) {
        this.player.anims.stop()
        this.testExplode = this.bounds.create(this.player.body.x + 20, this.player.body.y + 20);
        this.testExplode.anims.play('explodeKey', true)
        this.player.isAlive = false;
        this.player.visible = false;
        this.player.active = false;
        this.player.body.setEnable(false)
      }
    });

    //Player worldBounds collision
    this.physics.add.collider(this.bounds, this.player, () => {
      if(this.player.isAlive) {
        this.player.anims.stop()
        this.testExplode = this.bounds.create(this.player.body.x + 16, this.player.body.y + 16);
        this.testExplode.anims.play('explodeKey', true)
        this.player.isAlive = false;
        this.player.visible = false;
        this.player.active = false;
        this.player.body.setEnable(false)
      }
      
    });

    //Shot Boulder collision
    this.physics.add.collider(this.Missiles, this.boulders, (missile, boulder) => {
      this.coins.spawnCoin(boulder.body.x + 16, boulder.body.y + 16)
      this.boulders.boulderExplode(boulder.body.x + 16, boulder.body.y + 16)
      missile.destroy();
      boulder.destroy();
    });

    //Gib top/bottom bounds collision
    this.physics.add.collider(this.gibs, this.bounds, (gibs) => {
      gibs.destroy();
    })

    //Pillar leftBound collision
    this.physics.add.collider(this.pillars, this.specBound, (pillar) => {
      pillar.destroy();
    });

    //Boulder leftBound collision
    this.physics.add.collider(this.boulders, this.specBound, (boulder) => {
      boulder.destroy();
    })

    //Coin leftBound collision
    this.physics.add.collider(this.coins, this.specBound, (coin) => {
      coin.destroy();
    })

    //Player Coin collision
    this.physics.add.collider( this.coins, this.player, (player, coin) => {
      coin.destroy();
      this.events.emit('updateScore')
    }); 

    //Player boulder collision
    this.physics.add.collider( this.player, this.boulders, (player, boulder) => {
      if(this.player.isAlive) {
        this.player.anims.stop();
        this.testExplode1 = this.bounds.create(this.player.body.x + 16, this.player.body.y + 16);
        this.testExplode1.anims.play('explodeKey', true)
        this.player.isAlive = false;
        this.player.visible = false;
        this.player.active = false;
        this.player.body.setEnable(false);
      }
    });

    this.gameEndBoxes = this.physics.add.group();

    // this.scoreImage = this.add.sprite(350, 0, 'score')

    //Game over text
    this.gameOver = () => {
      this.gameOverBox = this.gameEndBoxes.create(350, 200)
      this.gameOverBox.anims.play('game-over')
      setTimeout(() => {
        this.restartBox = this.bounds.create(550, 200)
        this.restartBox.anims.play('click-restart')
      }, 2000);
      this.input.on('pointerup', () =>{
      axios.get('https://gameapi.org', this.score).then(res => {
        console.log(res)
        console.log(res.data)
      })
      this.events.emit('resetScore')
      this.events.off('updateScore')
      this.scene.restart();
      });
    }
  }

  createCursor() {
    
  }

  update(time, delta) {
// if (this.plaeyer.isAlive) this.player.update(time, delta, this.cursors)

   if (this.cursors.up.isDown || this.spaceKey.isDown) {
      if(this.spaceKey.isDown){
        if(this.spaceLimit == 0 && this.player.isAlive == true){
          this.spaceLimit = 1; 
          this.Missiles.shootMissile(this.player.body.x, this.player.body.y);
        }
      }

      if(this.cursors.up.isDown){
        this.player.setVelocityY(-160)
        this.player.anims.play('up', true)
      }
   }
   else if(this.cursors.right.isDown || this.spaceKey.isDown) {
      if(this.spaceKey.isDown){
        if(this.spaceLimit == 0 && this.player.isAlive == true){
          this.spaceLimit = 1; 
          this.Missiles.shootMissile(this.player.body.x, this.player.body.y);
        }
      }

      if(this.cursors.right.isDown){
        this.player.setVelocityX(100)
        this.player.setVelocityY(-10)
        this.player.anims.play('up', true)
      }
   }
   else if(this.cursors.left.isDown || this.spaceKey.isDown) {
      if(this.spaceKey.isDown){
        if(this.spaceLimit == 0 && this.player.isAlive == true){
          this.spaceLimit = 1; 
          this.Missiles.shootMissile(this.player.body.x, this.player.body.y);
        }
      }
      
      if(this.cursors.left.isDown){
        this.player.setVelocityX(-120)
        this.player.setVelocityY(-10)
        this.player.anims.play('up', true)
      }
   }
   else if(this.spaceKey.isDown){
     if(this.spaceLimit == 0 && this.player.isAlive == true){
      this.spaceLimit = 1; 
      this.Missiles.shootMissile(this.player.body.x, this.player.body.y);
     }
   }

   else {
     this.spaceLimit = 0
     this.player.setVelocityY(190)
     this.player.setVelocityX(-40)
     this.player.setFrame(0)
   }

  if(this.player.isAlive == false){
    if(this.firstUpdate == 0){
    this.gameOver();
    this.firstUpdate = 1;
    }
  }

   //update tilesprites
   this.fore.tilePositionX += 0.40;
   this.near.tilePositionX += 0.25;
   this.far.tilePositionX += 0.10;
   this.furthest.tilePositionX += 0.1;

   //move pillars
    this.pillars.setVelocityX(-120)
   //move boulders
   this.boulders.setVelocityX(-120)
   //move coins
   this.coins.setVelocityX(-60)



  }
}
