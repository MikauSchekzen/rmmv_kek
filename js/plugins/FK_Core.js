var Imported = Imported || {};
Imported.FK_Core = true;

var Fenrir = Fenrir || {};
Fenrir.Core = Fenrir.Core || {};

/*:
 * @plugindesc v1.0 Core functionality for Fenrirknight's plugins.
 * @author Fenrirknight
 */

//================================================================
// Game_Actor
//================================================================

Game_Actor.prototype.battleSprite = function() {
  var spriteset = SceneManager._scene._spriteset;
  if (spriteset) {
    var sprites = spriteset._actorSprites || [];
    return sprites.filter(function(sprite) {
      return sprite && sprite._actor === this;
    }, this)[0];
  } else {
    return null;
  }
}

Game_Actor.prototype.mapSprite = function() {
  var spriteset = SceneManager._scene._spriteset;
  if(spriteset) {
    var sprites = spriteset._characterSprites;
    return sprites.filter(function(sprite) {
      if(sprite && sprite._character["@"]) {
        if(sprite._character["@"] === "Game_Player") {
          return $gameParty.leader() === this;
        }
        else if(sprite._character["@"] === "Game_Follower") {
          return sprite._character.actor() === this;
        }
      }
    }, this)[0];
  }
  return null;
}


//================================================================
// Game_Enemy
//================================================================

Game_Enemy.prototype.battleSprite = function() {
  var spriteset = SceneManager._scene._spriteset;
  if (spriteset) {
    var sprites = spriteset._enemySprites || [];
    return sprites.filter(function(sprite) {
      return sprite && sprite._enemy === this;
    }, this)[0];
  } else {
    return null;
  }
}
