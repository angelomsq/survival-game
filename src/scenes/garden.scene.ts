import Phaser from 'phaser'
import { Player } from '../objects/player'
import { Enemy } from '../objects/enemy'
import { Bullet } from '../objects/bullet'

export default class GardenScene extends Phaser.Scene {
  // tilemap
  private map!: Phaser.Tilemaps.Tilemap
  private tileset!: Phaser.Tilemaps.Tileset
  private collisionsLayer!: Phaser.GameObjects.GameObject[]
  private collisions!: Phaser.GameObjects.Group
  private playArea!: Phaser.Geom.Rectangle

  // game objects
  private players!: Phaser.GameObjects.Group
  private playerBullets!: Phaser.GameObjects.Group
  private playerHurtbox!: Phaser.GameObjects.Group
  private enemies!: Phaser.GameObjects.Group
  private enemyBullets!: Phaser.GameObjects.Group
  private enemyHurtbox!: Phaser.GameObjects.Group
  private items!: Phaser.GameObjects.Group
  private gamePaused: boolean
  private player!: Player

  constructor() {
    super({
      key: 'GardenScene',
    })
    this.gamePaused = false
    // this.playerBulletGroup.setActive(false).setVisible(false)
  }

  create(): void {
    //MAP
    this.map = this.add.tilemap('map')
    this.tileset = this.map.addTilesetImage('survival_tileset_extruded', 'tiles', 16, 16, 1, 2)

    //CAMERAS
    this.cameras.main
      .setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
      .centerToBounds()
    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)

    //GROUPS
    this.collisions = this.physics.add.staticGroup()
    this.players = this.add.group({ runChildUpdate: true })
    this.playerBullets = this.physics.add.group({
      classType: Bullet,
      active: false,
      visible: false,
      maxSize: 1,
      runChildUpdate: true,
    })
    this.playerHurtbox = this.physics.add.group({ runChildUpdate: true })
    this.enemies = this.add.group({ runChildUpdate: true })
    this.enemyBullets = this.physics.add.group({
      classType: Bullet,
      active: false,
      runChildUpdate: true,
    })
    this.enemyHurtbox = this.physics.add.group({ runChildUpdate: true })
    this.items = this.add.group({ runChildUpdate: true })

    //LAYERS
    let count = 0
    this.map.layers.map((layer) => {
      let mapLayer = this.map.createLayer(layer.name, [this.tileset], 0, 0)
      mapLayer.setCollisionByProperty({ collides: true })
      this.physics.add.collider(this.players, mapLayer)
      this.physics.add.collider(this.enemies, mapLayer)
      mapLayer.setDepth(count)
      count++
    })

    //OBJECTS LAYER
    let wallsLayer = this.map.getObjectLayer('collisions')
    this.collisionsLayer = this.map.createFromObjects(wallsLayer.name, {
      name: 'wall',
    })
    this.collisions = this.physics.add.staticGroup(this.collisionsLayer, { runChildUpdate: true })
    this.collisions.setVisible(false)

    //This loads the collision tree, needed for overlapRect() on this.safePosition()
    // this.physics.world.step(0)

    this.playArea = new Phaser.Geom.Rectangle(
      32,
      32,
      this.map.widthInPixels - 64,
      this.map.heightInPixels - 64
    )

    this.player = new Player({
      scene: this,
      x: Math.round(this.map.widthInPixels / 2),
      y: Math.round(this.map.heightInPixels / 2),
      texture: 'player',
      width: 16,
      height: 16,
      speed: 80,
      health: 5,
      maxHealth: 5,
      maxBullets: 1,
      fireRate: 300,
      direction: 'down',
      score: 0,
      level: 1,
      bullets: this.playerBullets,
    })

    this.players.add(this.player)
    this.playerHurtbox.add(this.player.getHurtBox())
    this.player.setDepth(5)
    this.player.body.setCollideWorldBounds(true)
    this.cameras.main.startFollow(this.player).setZoom(1)
    console.log(this.cameras.main.displayWidth)
    console.log(this.cameras.main.displayHeight)

    this.time.addEvent({
      delay: 1000,
      callback: () => {
        const randomPoint = this.playArea.getRandomPoint()
        let skeleton = new Enemy({
          scene: this,
          x: randomPoint.x,
          y: randomPoint.y,
          texture: 'zombie',
          width: 16,
          height: 16,
          speed: 40,
          health: 1,
          maxHealth: 3,
          maxBullets: 1,
          fireRate: 300,
          direction: 'down',
          level: 1,
          damage: 1,
          target: this.player,
          bullets: this.enemyBullets,
        })

        skeleton.setDepth(5)

        this.enemies.add(skeleton)
        this.enemyHurtbox.add(skeleton.getHurtBox())
      },
      callbackScope: this,
      loop: true,
    })

    //SET OVERLAPS AND COLLISIONS
    this.physics.add.collider(this.players, this.collisionsLayer)
    this.physics.add.collider(this.enemies, this.collisionsLayer)

    this.physics.add.overlap(this.playerHurtbox, this.enemyHurtbox, this.playerTouchEnemy)

    this.physics.add.overlap(this.playerBullets, this.enemyHurtbox, this.enemyHit)
  }

  update(time: number, delta: number) {
    if (!this.gamePaused) {
      this.player.update(time, delta)
    }
    // this.textHUD.setText(this.player.getScore()); // set the text to show the current score
    // this.enemyGroup.getChildren().map( enemy => {
    //   enemy.update(time, delta);
    // })
    // let overlap = 'No';
    // var pointer = this.input.activePointer;
    // if(this.physics.overlapRect(pointer.worldX, pointer.worldY, 10, 10, true, true).length) overlap = 'Yes';
    // this.textclick.setText([
    //     'x: ' + this.cameras.main.centerX,
    //     'y: ' + this.cameras.main.centerY,
    //     'isDown: ' + pointer.isDown,
    //     'overlap: ' + this.physics.overlapRect(pointer.worldX, pointer.worldY, 10, 10, true, true).length
    // ]);
  }

  playerTouchEnemy(
    playerHurtbox: Phaser.GameObjects.GameObject,
    enemyHurtbox: Phaser.GameObjects.GameObject
  ): void {
    console.log('overlap enemy')
    console.log(this)
    let player = playerHurtbox.getData('parent')
    let enemy = enemyHurtbox.getData('parent')
    player.depthSort(enemy)
    if (!player.isInvincible && !player.isDying) {
      player.hit(enemy.damage)
      player.currentScene.cameras.main.shake(300, 0.005)
    }
  }

  enemyHit(bulletBox: Phaser.GameObjects.GameObject, enemyHurtbox: Phaser.GameObjects.GameObject) {
    const bullet = bulletBox as Bullet
    let enemy = enemyHurtbox.getData('parent')
    if (!enemy.isInvincible) {
      bullet.kill()
      enemy.hit(bullet.getDamage())
      //TODO: Show Enemy lifebar
    } else {
      bullet.kill()
    }
    // enemy.kill()
  }
}
