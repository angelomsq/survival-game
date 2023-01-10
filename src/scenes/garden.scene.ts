import BaseScene from './base.scene'

export default class GardenScene extends BaseScene {
  constructor() {
    super({
      key: 'GardenScene',
      mapKey: 'survival',
      tilesetKey: 'tiles',
      tilesetName: 'survival_tileset_extruded',
    })
  }
}
