export class Env  {
  constructor(size) {
    this.size = size;
    this.map = new Array(this.size);
    for (let i = 0; i < this.size; i++) {
      this.map[i] = new Array(this.size);
      for (let j = 0; j < this.size; j++) {
        this.map[i][j] = new Static("land",j,i,true);
      }
    }
  }
}

export class Living  {
  constructor(name,lvl,exp,health,strength,x,y) {
    this.name = name;
    this.lvl = lvl;
    this.exp = exp;
    this.health = health;
    this.strength = strength;
    this.pos_y = x;
    this.pos_x = y;
    this.satchel = [];
  }

  move(y, x, an_env){
    if ((y < an_env.size && y >= 0) && (x < an_env.size && x >= 0) && ((an_env.map[y][x]).passable === true)){
      // Transistion position on map in an_env object
      an_env.map[this.pos_y][this.pos_x] = new Static("land",this.pos_y,this.pos_x,true);
      // Updates the position of the living object
      this.pos_y = y;
      this.pos_x = x;
      return true;
    }
    return false;
  }

  // Returns a number between 1 and max
  mod(max) {
    return Math.ceil(Math.random() * max); //1-5 && 1-10
  }

  attack(target) {
    let roll1 = this.mod(6)
    let roll2 = (this.mod(10) / 10)
    if (roll1 === 1){
      return false;
    }else if (roll1 < 6){
      target.health -= Math.floor(this.strength + (roll2 * this.strength));
    }else{
      target.health -= Math.floor((this.strength + (roll2 * this.strength)) * 1.25);
    }
  }

  death(an_env) {
    if (this.health <= 0){
      an_env.map[this.pos_y][this.pos_x] = 0;
      return true;
    }
    return false;
  }

  pick_up_items(loot){
    this.satchel.push(loot);
  }
  add_tome(spell){
    spell.usage_count = 0;
    this.spellbook.push(spell);
    this.satchel = this.satchel.filter((item) => {
      return item.usage_count > 0;
    });
  }
  equip_gear(gear) {
    gear.usage_count = 0;
    this.equipment.push(gear);
    this.satchel = this.satchel.filter((item) => {
      return item.usage_count > 0;
    });
  }
}

export class Player extends Living {
  constructor(name) {
    // name,lvl,exp,health,strength,x,y
    super(name,1,0,100,5,0,0);
    this.mana = 50;
    this.spellbook = [];
    this.equipment = [];
  }

  item_use(an_item) {
    --an_item.usage_count;
    this.health += an_item.health
    this.mana += an_item.mana
    this.exp += an_item.exp
    this.strength += an_item.strength
    this.satchel = this.satchel.filter((item) => {
      return item.usage_count > 0;
    });
  }

  flee() {
    let roll = mod(5)
    if (roll < 3){
      return true
    }else{
      return false
    }
  }

  cast(spell, target) {
    target.health += spell.health + (spell.health * (this.lvl * 0.1));
    this.mana += spell.mana;
  }

  lvl_up() {
    if (this.exp >= (this.lvl * 100)){
      this.exp -= (this.lvl * 100);
      this.lvl += 1;
      this.health += 100
      this.mana += 50
      this.strength += 5
      return true;
    }
  }

  death(an_env) {
    if (super.death(an_env)){
      if (this.lvl > 1){
        this.lvl -= 1
      }
      this.exp = 0
      this.satchel = []
      this.health = 100 + (100 * this.lvl)
      this.mana = 50 + (50 * this.lvl)
      this.strength = 5 + (5 * this.lvl)
      return true
    };
  };
};

export class Enemy extends Living {
  constructor(name,lvl,x,y) {
    // name,lvl,exp,health,strength,x,y
    super(name,lvl,(lvl*5),(lvl*30),(lvl * 3),x,y);
  }

  death(player, an_env) {
    if (super.death(an_env)) {
      player.exp += this.exp;
      player.pick_up_items(this.satchel[0]);
      //player.health += 10 (bonus after combat)
      return true;
    }
  }
}

export class Static {
  constructor(name, x, y, passable) {
    this.name = name
    this.x = x
    this.y = y
    this.passable = passable
  }
  placement(an_env){
    an_env.map[this.y][this.x] = this;
  }
}

export class Item extends Static {
  constructor(name, x, y, exp, health, mana, strength, usage_count) {
    super(name, x, y, true);
    this.exp = exp;
    this.health = health;
    this.mana = mana;
    this.strength = strength;
    this.usage_count = usage_count;
  }
}

export class Equipment extends Item {
  constructor (name, x, y, health, mana, strength) {
    super(name, x, y, 0, health, mana, strength, 1);
    this.equip = true
  }
}

export class Tome extends Item {
  constructor(name, x, y, health, mana) {
    super(name, x, y, 0, health, mana, 0, 1);
    this.equip = true
  }
}

// export class Exit extends Static {
//   constructor(name, x, y, passable) {
//     super("exit", x, y, true)
//   }
//   //regen map here when we figure out how
// }
