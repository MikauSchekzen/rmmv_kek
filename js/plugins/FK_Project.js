var Imported = Imported || {};
Imported.FK_Project = true;

var Fenrir = Fenrir || {};
Fenrir.Project = Fenrir.Project || {};


/*:
 * @plugindesc Dungeoneering for Dummies specific things.
 * @author FenrirKnight
 *
 * @param -- Audio --
 *
 * @param Miss Sound Effects
 * @desc List of sound effects to use for missed physical attacks. Separate with spaces.
 * @default Swing Swing2
 *
 * @param Hit Flesh Sound Effects
 * @desc List of sound effects to use for physical attacks on armor-less targets. Separate with spaces.
 * @default Physical_Hit Physical_Hit2 Physical_Hit3
 *
 * @param Hit Armor Sound Effects
 * @desc List of sound effects to use for physical attacks on armored targets. Separate with spaces.
 * @default Melee_Hit Melee_Hit2
 *
 * @param Armored State
 * @desc A single state to determine whether battler is armored.
 * @default 20
 */

Fenrir.Project.parameters           = PluginManager.parameters("FK_Project");

Fenrir.Project.missSoundEffects     = Fenrir.Project.parameters["Miss Sound Effects"].split(" ");
Fenrir.Project.hitFleshSoundEffects = Fenrir.Project.parameters["Hit Flesh Sound Effects"].split(" ");
Fenrir.Project.hitArmorSoundEffects = Fenrir.Project.parameters["Hit Armor Sound Effects"].split(" ");
Fenrir.Project.armoredState         = Number(Fenrir.Project.parameters["Armored State"]);


// Takes care to not fade out title screen music when starting a new game.
// Scene_Base.prototype.fadeOutAll = function() {
//    var time = this.slowFadeSpeed() / 60;
//    AudioManager.fadeOutBgs(time);
//    AudioManager.fadeOutMe(time);
//    this.startFadeOut(this.slowFadeSpeed());
// };

SoundManager.playMiss = function() {
  var arr = Fenrir.Project.missSoundEffects;
  var a = Math.floor(Math.random() * arr.length);
  AudioManager.playSe({name: arr[a], volume: 90, pitch: 100});
};

Fenrir.Project.Game_Battler_performDamage = Game_Battler.prototype.performDamage;
Game_Battler.prototype.performDamage = function() {
  Fenrir.Project.Game_Battler_performDamage.call(this);
  SoundManager.playBattlerDamage(this);
}

SoundManager.playActorDamage = function() {
  // var arr = Fenrir.Project.hitFleshSoundEffects;
  // var a = Math.floor(Math.random() * arr.length);
  // AudioManager.playSe({name: arr[a], volume: 90, pitch: 100});
};

SoundManager.playEnemyDamage = function() {
  // var arr = Fenrir.Project.hitFleshSoundEffects;
  // var a = Math.floor(Math.random() * arr.length);
  // AudioManager.playSe({name: arr[a], volume: 90, pitch: 100});
};

SoundManager.pickBattlerDamage = function(battler) {
  var arr = Fenrir.Project.hitFleshSoundEffects;
  if(battler.isStateAffected(Fenrir.Project.armoredState)) arr = Fenrir.Project.hitArmorSoundEffects;
  var a = Math.floor(Math.random() * arr.length);
  return arr[a];
}

SoundManager.playBattlerDamage = function(battler) {
  var snd = SoundManager.pickBattlerDamage(battler);
  AudioManager.playSe({ name: snd, volume: 90, pitch: 100 });
}
