var Imported = Imported || {};
Imported.FK_Projectiles = true;

var Fenrir = Fenrir || {};
Fenrir.Projectiles = Fenrir.Projectiles || {};

/*:
 * @plugindesc v0.1 Projectile animations.
 * @author Fenrirknight
 *
 * @help
 * Adds projectile animations to sideview battle systems.
 * Requires Yanfly Battle Core.
 * projectile user: target, icon 64; speed 50; arc 60; anim 67; wait
 *
 * ============================================================================
 * Action Sequences - Action List
 * ============================================================================
 *
 * The following contains a list of the actions you can use inside the five
 * action sequences. Each action has a unique function and requires certain
 * formats to operate properly.
 *
 * =============================================================================
 * PROJECTILE origin: target, icon x; [options]
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * This launches a projectile from 'origin' to 'target', having icon 'x' as
 * its graphic.
 *
 * Options should be separated with a ';', and include:
 * 'speed x': Replace 'x' with the number of pixels per frame the projectile
 * should move at.
 * 'arc x': Replace 'x' with a number to let the projectile arc. Negative
 * values create upside-down arcs.
 * 'end anim x': Replace 'x' with the animation ID in the database to show
 * when the projectile hits its target.
 * 'start anim x': Replace 'x' with the animation ID in the database to show
 * when the projectile launches.
 * 'spin x': Replace 'x' with the degrees per frame the graphic should rotate
 * while moving. Negative values can be used.
 * 'angle x': Replace 'x' with the angle the graphic should start at.
 * 'duration x': Can be used instead of 'speed x', to have a set duration
 * the projectile should move to the target. The duration ('x') is in frames.
 * 'home offset x.y': Replace 'x' with the horizontal and 'y' with the
 * vertical offset the graphic should start positioned at.
 * 'wait': Waits until the projectile has hit its target before executing
 * anything else in the action sequence.
 * - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Usage Example: camera clamp on
 *                camera clamp off
 * =============================================================================
*/


//==============================================
// Sprite_Projectile
//==============================================

function Sprite_Projectile() {
  this.initialize.apply(this, arguments);
}

Sprite_Projectile.prototype = Object.create(Sprite_Base.prototype);
Sprite_Projectile.prototype.constructor = Sprite_Projectile;

Sprite_Projectile.prototype.initialize = function(origin, target, baseObject) {
  Sprite_Base.prototype.initialize.call(this);
  this.anchor.x = 0.5;
  this.anchor.y = 0.5;
  this.initMembers(origin, target);
  this.setBaseObject(baseObject);
  this.initBitmap();
  this.initPositioning();
  this.initArc();
  this.initDuration();
  this.setupAnimation("start");
}

Sprite_Projectile.prototype.initMembers = function(origin, target) {
  this._iconIndex = null;
  this._origin = origin;
  this._target = target;
  this.homePos = { x: 0, y: 0 };
  this.targetPos = { x: 0, y: 0 };
  this.offset = { x: 0, y: 0 };
  this.arc = { peak: 0, height: 0, invert: false };
  this._distance = 0;
  this._duration = 0;
  this._startingDuration = 0;
  this.rotation = 0;
  this._baseObject = null;
}

Sprite_Projectile.prototype.setBaseObject = function(baseObject) {
  this._baseObject = baseObject;
}

Sprite_Projectile.prototype.baseObject = function() {
  return this._baseObject;
}

Sprite_Projectile.prototype.origin = function() {
  return this._origin;
}

Sprite_Projectile.prototype.target = function() {
  return this._target;
}

Sprite_Projectile.prototype.initBitmap = function() {
  if(!this.baseObject() && !this.baseObject().image) this.remove();
  if(this.baseObject().image[0] === "icon") this._iconIndex = this.baseObject().image[1];
  SceneManager._scene._spriteset.addChild(this);
}

Sprite_Projectile.prototype.initPositioning = function() {
  this.homePos.x = this.origin().battleSprite().x + this.baseObject().homeOffset.x;
  this.homePos.y = this.origin().battleSprite().y + this.baseObject().homeOffset.y;
  this.targetPos.x = this.target().battleSprite().x - this.homePos.x;
  this.targetPos.y = this.target().battleSprite().y - this.homePos.y;
  this.x = this.homePos.x;
  this.y = this.homePos.y;
}

Sprite_Projectile.prototype.initArc = function() {
  var distance = Math.sqrt(Math.abs(this.targetPos.x) + 50);
  this.arc.peak = Math.floor(Math.abs(this.baseObject().arc) * distance / 20);
  this.arc.height = 0;
  this.arc.invert = this.baseObject().arc < 0;
}

Sprite_Projectile.prototype.initDuration = function() {
  var dur = this.baseObject().duration;
  this._distance = Math.sqrt(Math.pow(this.targetPos.x, 2) + Math.pow(this.targetPos.y, 2));
  this._duration = dur ? dur : Math.floor(this._distance * 5 / this.baseObject().speed);
  this._startingDuration = this._duration;
}

Sprite_Projectile.prototype.update = function() {
  Sprite_Base.prototype.update.call(this);
  this.updateBitmap();
  this.updateMove();
  this.updateArc();
  this.updateAngle();
  this.updatePosition();
}

Sprite_Projectile.prototype.updateBitmap = function() {
  if(this._iconIndex) {
    this.bitmap = ImageManager.loadSystem("IconSet");
    this.bitmap.addLoadListener(this.updateIcon.bind(this));
  }
}

Sprite_Projectile.prototype.updateIcon = function() {
  var w = Window_Base._iconWidth;
  var h = Window_Base._iconHeight;
  var x = this._iconIndex % 16 * w;
  var y = Math.floor(this._iconIndex / 16) * h;
  this.setFrame(x, y, w, h);
}

Sprite_Projectile.prototype.updateMove = function() {
  if(this._duration > 0) {
    var d = this._duration;
    this.offset.x = (this.offset.x * (d - 1) + this.targetPos.x) / d;
    this.offset.y = (this.offset.y * (d - 1) + this.targetPos.y) / d;
    this._duration--;
    if(this._duration === 0) this.onEnd();
  }
}

Sprite_Projectile.prototype.updateArc = function() {
  if(this.arc.peak) {
    var height = this.arc.peak;
    var radius = this._startingDuration / 2;
    var position = this._duration - radius;
    var distance = (1 - (Math.pow(position, 2) / Math.pow(radius, 2)));
    this.arc.height = Math.sqrt(Math.pow(height, 2) * distance);
    if(this.arc.invert) this.arc.height *= -1;
  }
}

Sprite_Projectile.prototype.updateAngle = function() {
  if(this.baseObject().spin) this.rotation += this.baseObject().spin;
  if(this.baseObject().angle) {
    if(this.baseObject().user.isActor()) this.rotation = this.baseObject().angle * Math.PI / 180;
    else this.rotation = ((this.baseObject().angle + 180) % 360) * Math.PI / 180;
  }
}

Sprite_Projectile.prototype.updatePosition = function() {
  this.x = this.homePos.x + this.offset.x;
  this.y = this.homePos.y + this.offset.y - this.arc.height;
}

Sprite_Projectile.prototype.onEnd = function() {
  this.setupAnimation("end");
  BattleManager.removeProjectile(this);
  this.remove();
}

Sprite_Projectile.prototype.setupAnimation = function(type) {
  if(type === "end" && this.baseObject().endAnim) {
    var anim = this.baseObject().endAnim;
    if(anim.constructor === String) {
      switch(anim.toUpperCase()) {
        case "ATTACK":
        BattleManager._logWindow.showAttackAnimation(this.baseObject().user, [this.target()]);
        break;
      }
    }
    else {
      this.target().startAnimation(this.baseObject().endAnim, false, 0);
    }
  }
  else if(type === "start" && this.baseObject().startAnim) {
    var anim = this.baseObject().startAnim;
    if(anim.constructor === String) {
      switch(anim.toUpperCase()) {
        case "ATTACK":
        BattleManager._logWindow.showAttackAnimation(this.baseObject().user, [this.origin()]);
        break;
      }
    }
    else {
      this.origin().startAnimation(this.baseObject().startAnim, false, 0);
    }
  }
}

Sprite_Projectile.prototype.remove = function() {
  if(this.parent) {
    this.parent.removeChild(this);
  }
}


//==============================================
// BattleManager
//==============================================

Fenrir.Projectiles.BattleManager_initMembers = BattleManager.initMembers;
BattleManager.initMembers = function() {
  Fenrir.Projectiles.BattleManager_initMembers.call(this);
  this._projectiles = [];
}

Fenrir.Projectiles.BattleManager_processActionSequence = BattleManager.processActionSequence;
BattleManager.processActionSequence = function(actionName, actionArgs) {
  // THROW
  if(actionName.match(/PROJECTILE[ ](.*)/i)) {
    var str = String(RegExp.$1);
    if(this.makeActionTargets(str).length > 0) {
      return this.actionThrow(str, actionArgs);
    }
  }
  // WAIT FOR THROW
  if(actionName.match(/WAIT FOR PROJECTILE[S]?/i)) {
    return this.actionWaitForThrow();
  }
  return Fenrir.Projectiles.BattleManager_processActionSequence.call(this, actionName, actionArgs);
}

BattleManager.actionWaitForThrow = function() {
  this._logWindow.waitForProjectiles();
}

BattleManager.actionThrow = function(originStr, actionArgs) {
  var origins = this.makeActionTargets(originStr);
  var targets = this.makeActionTargets(String(actionArgs[0]));
  // Assemble data
  var obj = {
    image: ["icon", 0],
    homeOffset: { x: 0, y: 0 },
    speed: 100,
    arc: 0,
    spin: 0,
    angle: 0,
    duration: null,
    endAnim: 0,
    startAnim: 0,
    wait: false,
    user: this._subject
  };
  var params = actionArgs[1].split(/(?:;[ ]?)+/);
  for(var a = 0;a < params.length;a++) {
    var str = params[a].trim();
    if(str.match(/ICON[ ]([0-9]+)/i)) {
      obj.image[0] = "icon";
      obj.image[1] = Number(RegExp.$1);
    }
    else if(str.match(/SPEED[ ]([0-9]+)/i)) {
      obj.speed = Number(RegExp.$1);
    }
    else if(str.match(/ARC[ ](-?[0-9]+)/i)) {
      obj.arc = Number(RegExp.$1);
    }
    else if(str.match(/^(?:END[ ]?)?ANIM(?:ATION)?[ ]([0-9]+|ATTACK)/i)) {
      var str = RegExp.$1;
      if(str.toUpperCase() === "ATTACK") obj.endAnim = "attack";
      else obj.endAnim = Number(str);
    }
    else if(str.match(/START[ ]?ANIM(?:ATION)?[ ]([0-9]+|ATTACK)/i)) {
      var str = RegExp.$1;
      if(str.toUpperCase() === "ATTACK") obj.startAnim = "attack";
      else obj.startAnim = Number(str);
    }
    else if(str.match(/SPIN[ ](-?[0-9]+)/i)) {
      obj.spin = Number(RegExp.$1);
    }
    else if(str.match(/ANGLE[ ](-?[0-9]+)/i)) {
      obj.angle = Number(RegExp.$1);
    }
    else if(str.match(/DURATION[ ]([0-9+])/i)) {
      obj.duration = Number(RegExp.$1);
    }
    else if(str.match(/HOME[ ]OFFSET[ ](-?[0-9]+)\.(-?[0-9]+)/i)) {
      obj.homeOffset.x = Number(RegExp.$1);
      obj.homeOffset.y = Number(RegExp.$2);
    }
    else if(str.match(/WAIT/i)) {
      obj.wait = true;
    }
  }
  // Throw object(s)
  for(var a = 0;a < origins.length;a++) {
    var origin = origins[a];
    for(var b = 0;b < targets.length;b++) {
      var target = targets[b];
      this.startThrow(origin, target, obj);
    }
  }
}

BattleManager.startThrow = function(origin, target, obj) {
  var spr = new Sprite_Projectile(origin, target, obj);
  this.addProjectile(spr, obj.wait);
}

BattleManager.addProjectile = function(projectileSprite, wait) {
  if(wait === undefined) wait = false;

  this._projectiles.push({
    sprite: projectileSprite,
    wait: wait
  });
}

BattleManager.removeProjectile = function(projectileSprite) {
  for(var a = 0;a < this._projectiles.length;a++) {
    var proj = this._projectiles[a];
    if(proj.sprite === projectileSprite) {
      this._projectiles.splice(a, 1);
      break;
    }
  }
}


//==============================================
// Window_BattleLog
//==============================================

Window_BattleLog.prototype.waitForProjectiles = function() {
  this.setWaitMode("projectile");
}

Fenrir.Projectiles.Window_BattleLog_updateWaitMode = Window_BattleLog.prototype.updateWaitMode;
Window_BattleLog.prototype.updateWaitMode = function() {
  if(this._waitMode === "projectile") {
    var waiting = BattleManager._projectiles.filter(function(obj) {
      if(obj.wait) return true; return false;
    }).length > 0;
    if(!waiting) this._waitMode = "";
    return waiting;
  }
  return Fenrir.Projectiles.Window_BattleLog_updateWaitMode.call(this);
}
