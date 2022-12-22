import Phaser from 'phaser'
import { Player } from '../objects/player'

export default class GardenScene extends Phaser.Scene {
  // tilemap
  private map!: Phaser.Tilemaps.Tilemap
  private tileset!: Phaser.Tilemaps.Tileset
  private collisionsLayer!: Phaser.GameObjects.GameObject[]

  // game objects
  private players!: Phaser.GameObjects.Group
  private playerBullets!: Phaser.GameObjects.Group
  private enemies!: Phaser.GameObjects.Group
  private enemyBullets!: Phaser.GameObjects.Group
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
    console.log(this.tileset)

    //CAMERAS
    this.cameras.main
      .setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)
      .centerToBounds()
    this.physics.world.setBounds(0, 0, this.map.widthInPixels, this.map.heightInPixels)

    //GROUPS
    this.players = this.add.group({ runChildUpdate: true })
    this.playerBullets = this.add.group({ runChildUpdate: true })
    this.enemies = this.add.group({ runChildUpdate: true })
    this.enemyBullets = this.add.group({ runChildUpdate: true })
    this.items = this.add.group({ runChildUpdate: true })

    //LAYERS
    let count = 0
    this.map.layers.map((layer) => {
      // console.log(layer)
      let mapLayer = this.map.createLayer(layer.name, [this.tileset], 0, 0)
      mapLayer.setCollisionByProperty({ collides: true })
      this.physics.add.collider(this.players, mapLayer)
      mapLayer.setDepth(count)
      count++
    })

    //OBJECTS LAYER
    // this.map.objects.map((layer) => {
    //   if (layer.name == 'collisions') {
    //     this.collisionsLayer = this.map.createFromObjects(layer.name, {
    //       gid: layer.objects[0].gid,
    //     })
    //     this.collisionsLayer.forEach((wall: Phaser.GameObjects.GameObject) => {
    //       console.log(wall)
    //       // wall.setDisplaySize()
    //       wall.width = wall.width * wall._scaleX
    //       wall.height = wall.height * wall._scaleY
    //       this.physics.world.enable(wall)
    //       wall.body.immovable = true
    //       wall.visible = false
    //     })
    //   }
    // })
    //This loads the collision tree, needed for overlapRect() on this.safePosition()
    // this.physics.world.step(0)

    this.player = new Player({
      scene: this,
      x: Math.round(this.map.widthInPixels / 2),
      y: Math.round(this.map.heightInPixels / 2),
      texture: 'player',
      width: 10,
      height: 16,
      speed: 80,
      health: 5,
      maxHealth: 5,
      maxBullets: 1,
      fireRate: 300,
      direction: 'down',
      score: 0,
      level: 1,
    })

    // this.player.setDepth(5)

    // this.playerGroup.add(this.player)
    // this.playerHurtboxGroup.add(this.player.hurtbox)

    // this.playerGroup.setDepth(5)

    // //stop player when arrows are not pressed
    // this.input.keyboard.on('keyup', (event) => {
    //   if (event.keyCode >= 37 && event.keyCode <= 40 && !this.player.isAttacking) {
    //     this.player.stop()
    //   }
    // })
  }

  update(time: number, delta: number) {
    if (!this.gamePaused) this.player.update(time, delta)
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
}
