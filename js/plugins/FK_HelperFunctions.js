var Imported = Imported || {};
Imported.FK_HelperFunctions = true;

var Fenrir = Fenrir || {};
Fenrir.HelperFunctions = Fenrir.HelperFunctions || {};

/*:
 * @plugindesc An addon to Yanfly's Buffs and States addon, for people with some JavaScript knowledge
 * @author FenrirKnight
 *
 * @param ---Map related---
 *
 * @param Unteleportable maps
 * @desc Maps that can't be teleported from. Separate map IDs with spaces.
 * @default 1 2
 *
 * @param Overworld maps
 * @desc Maps that are considered overworld
 * @default 3
 *
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * Adds helper functions.
 *
 * ============================================================================
 * Notetags
 * ============================================================================
 *
 * State Notetags:
 *
 *   <stat Plus Eval>
 *    code
 *    code
 *   </stat Plus Eval>
 *   Replace 'stat' with a base parameter name, like 'atk' or 'mhp'.
 *   Usable variables:   value  : Result, defaults to 0.
 *
 *  <stat Rate Eval>
 *   code
 *   code
 *  </stat Rate Eval>
 *  Replace 'stat' with a base parameter name, like 'atk' or 'mhp'.
 *  Usable variables:   value  : Result, defaults to 1. Multiply the value
 *                                by 1.1 to increase it by 10%, for example.
 *
 * State, Weapon, Armor, Enemy, Actor and Class Notetags:
 *
 *   <'state' category resistance: 'value'>
 *   Replace 'state' with a category you set for a state, and 'value'
 *    with the resistance value you want. 100% is normal, 50% if half
 *    as effective, 0% is immune, etc.
*/


Fenrir.HelperFunctions.parameters = PluginManager.parameters("FK_HelperFunctions");

Fenrir.HelperFunctions.unteleportableMaps = [];
Fenrir.HelperFunctions.parameters["Unteleportable maps"].split(" ").forEach(function(a) {
  Fenrir.HelperFunctions.unteleportableMaps.push(Number(a));
});
Fenrir.HelperFunctions.overworldMaps = [];
Fenrir.HelperFunctions.parameters["Overworld maps"].split(" ").forEach(function(a) {
  Fenrir.HelperFunctions.overworldMaps.push(Number(a));
});


//===================================================
// DataManager
//===================================================

Fenrir.HelperFunctions.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
  if(!Fenrir.HelperFunctions.DataManager_isDatabaseLoaded.call(this)) return false;

  this.processNotetagsFenrirHelper1($dataItems);
  this.processNotetagsFenrirHelper1($dataSkills);
  this.processNotetagsFenrirHelperParams($dataStates);
  if(Imported.YEP_X_StateCategories) {
    this.processNotetagsFenrirHelperStateCategories($dataStates);
    this.processNotetagsFenrirHelperStateCategories($dataWeapons);
    this.processNotetagsFenrirHelperStateCategories($dataArmors);
    this.processNotetagsFenrirHelperStateCategories($dataEnemies);
    this.processNotetagsFenrirHelperStateCategories($dataActors);
    this.processNotetagsFenrirHelperStateCategories($dataClasses);
  }

  return true;
}

// Valid action checking
DataManager.processNotetagsFenrirHelper1 = function(group) {
  for(var a = 1;a < group.length;a++) {
    var obj = group[a];
    var notedata = obj.note.split(/[\r\n]+/);
    var evalMode = "none";

    obj.validityEval = "";

    for(var b = 0;b < notedata.length;b++) {
      var line = notedata[b];

      if(line.match(/<CUSTOM VALIDITY>/i)) {
        evalMode = "validity";
        obj.validityEval = "";
      }
      else if(line.match(/<\/CUSTOM VALIDITY>/i)) {
        evalMode = "none";
      }
      else if(evalMode === "validity") {
        obj.validityEval = obj.validityEval + line + "\n";
      }
    }
  }
}

// Base Param Control
DataManager.processNotetagsFenrirHelperParams = function(group) {
  for(var a = 1;a < group.length;a++) {
    var obj = group[a];
    var notedata = obj.note.split(/[\n\r]+/);

    obj.paramPlusEvals = ["","","","","","","",""];
    obj.paramRateEvals = ["","","","","","","",""];

    var evalMode = "none";
    var evalSub = 0;

    for(var b = 0;b < notedata.length;b++) {
      var line = notedata[b];

      if(line.match(/<(?!\/)(.*) PLUS EVAL>/i)) {
        var text = String(RegExp.$1).toUpperCase();
        var id = this.getParamId(text);
        if(id !== null) {
          evalMode = "param-plus-eval";
          evalSub = id;
          obj.paramPlusEvals[evalSub] = "";
        }
      }
      else if(line.match(/<\/(.*) PLUS EVAL>/i)) {
        evalMode = "none";
      }
      else if(line.match(/<(?!\/)(.*) RATE EVAL>/i)) {
        var text = String(RegExp.$1).toUpperCase();
        var id = this.getParamId(text);
        if(id !== null) {
          evalMode = "param-rate-eval";
          evalSub = id;
          obj.paramRateEvals[evalSub] = "";
        }
      }
      else if(line.match(/<\/(.*) RATE EVAL>/i)) {
        evalMode = "none";
      }
      else if(evalMode === "param-plus-eval") {
        obj.paramPlusEvals[evalSub] += line + "\n";
      }
      else if(evalMode === "param-rate-eval") {
        obj.paramRateEvals[evalSub] += line + "\n";
      }
    }
  }
}

DataManager.processNotetagsFenrirHelperStateCategories = function(group) {
  for(var a = 1;a < group.length;a++) {
    var obj = group[a];
    var notedata = obj.note.split(/[\r\n]+/i);

    obj.stateCategoryRate = {};

    for(var b = 0;b < notedata.length;b++) {
      var line = notedata[b];

      if(line.match(/<(.*) CATEGORY RATE: ([0-9]+)\%>/i)) {
        obj.stateCategoryRate[RegExp.$1.toUpperCase()] = Number(RegExp.$2) / 100;
      }
    }
  }
}



//===================================================
// Game_Action
//===================================================

Fenrir.HelperFunctions.Game_Action_testApply = Game_Action.prototype.testApply;
Game_Action.prototype.testApply = function(target) {
  if(this.item().validityEval !== "") {
    var value = true;
    eval(this.item().validityEval);
    return value;
  }
  return Fenrir.HelperFunctions.Game_Action_testApply.call(this, target);
}


//===================================================
// Game_Battler
//===================================================

// OVERRIDE
Game_Battler.prototype.customEffectEval = function(stateId, type) {
    var state = $dataStates[stateId];
    if (!state) return;
    if (state.customEffectEval[type] === '') return;
    this._stateData[stateId] = this._stateData[stateId] || {};
    var stateData = this.getStateData(stateId);
    var a = this;
    var user = this;
    var target = this;
    var origin = this.stateOrigin(stateId);
    var s = $gameSwitches._data;
    var v = $gameVariables._data;
    eval(state.customEffectEval[type]);
};

// OVERRIDE
Game_Action.prototype.customEffectEval = function(target, stateId, type, side, value) {
    var state = $dataStates[stateId];
    if (!state) return value;
    if (state.customEffectEval[type] === '') return value;
    var attacker = this.subject();
    var defender = target;
    var a = this.subject();
    var b = target;
    var stateDataA = attacker.getStateData(stateId);
    var stateDataB = defender.getStateData(stateId);
    var user = this.subject();
    var origin = side.stateOrigin(stateId);
    var s = $gameSwitches._data;
    var v = $gameVariables._data;
    eval(state.customEffectEval[type]);
    return value;
};

// State category rates
if(Imported.YEP_X_StateCategories) {

Game_BattlerBase.prototype.getStateCategoryRate = function(category) {
  var value = 1;

  var objs = [this.states()];
  if(this.isActor()) {
    objs.push([this.currentClass()]);
    objs.push(this.equips());
    objs.push([this.actor()]);
  }
  else if(this.isEnemy()) {
    objs.push([this.enemy()]);
  }

  for(var a = 0;a < objs.length;a++) {
    var group = objs[a];
    for(var b = 0;b < group.length;b++) {
      var obj = group[b];
      if(obj && obj.stateCategoryRate && obj.stateCategoryRate[category.toUpperCase()]) {
        value *= obj.stateCategoryRate[category.toUpperCase()];
      }
    }
  }
  return value;
}

// State category rates
Fenrir.HelperFunctions.Game_BattlerBase_stateRate = Game_BattlerBase.prototype.stateRate;
Game_BattlerBase.prototype.stateRate = function(stateId) {
  var result = Fenrir.HelperFunctions.Game_BattlerBase_stateRate.call(this, stateId);
  var cats = $dataStates[stateId].category;
  for(var a = 0;a < cats.length;a++) {
    result *= this.getStateCategoryRate(cats[a]);
  }
  return result;
}

}

// Base Param Control
Fenrir.HelperFunctions.Game_Battler_paramPlus = Game_Battler.prototype.paramPlus;
Game_Battler.prototype.paramPlus = function(paramId) {
  var value = Fenrir.HelperFunctions.Game_Battler_paramPlus.call(this, paramId);
  for(var a = 0;a < this.states().length;a++) {
    var obj = this.states()[a];
    if(obj && obj.paramPlusEvals[paramId] !== "") {
      value += (function(user, stateData, origin, formula) {
        var value = 1;
        eval(formula);
        return value;
      })(this, this.getStateData(obj.id), this.stateOrigin(obj.id), obj.paramPlusEvals[paramId]);
    }
  }
  return value;
}

// Base Param Control
Fenrir.HelperFunctions.Game_Battler_paramRate = Game_Battler.prototype.paramRate;
Game_Battler.prototype.paramRate = function(paramId) {
  var value = Fenrir.HelperFunctions.Game_Battler_paramRate.call(this, paramId);
  for(var a = 0;a < this.states().length;a++) {
    var obj = this.states()[a];
    if(obj && obj.paramRateEvals[paramId] !== "") {
      value *= (function(user, stateData, origin, formula) {
        var value = 1;
        eval(formula);
        return value;
      })(this, this.getStateData(obj.id), this.stateOrigin(obj.id), obj.paramRateEvals[paramId]);
    }
  }
  return value;
}

Fenrir.HelperFunctions.Game_Battler_initMembers = Game_Battler.prototype.initMembers;
Game_Battler.prototype.initMembers = function() {
  Fenrir.HelperFunctions.Game_Battler_initMembers.call(this);
  this._stateData = {};
}

Game_Battler.prototype.getStateData = function(id) {
  if(this._stateData[id]) return this._stateData[id];
  this._stateData[id] = {};
  return this._stateData[id];
}

Fenrir.HelperFunctions.Game_Battler_removeState = Game_Battler.prototype.removeState;
Game_Battler.prototype.removeState = function(stateId) {
  Fenrir.HelperFunctions.Game_Battler_removeState.call(this, stateId);
  this.clearStateData(stateId);
}

Game_Battler.prototype.clearStateData = function(stateId) {
  if(this._stateData[stateId]) delete this._stateData[stateId];
}


/*
 * Game_Map
*/

Game_Map.prototype.isUnteleportable = function() {
  return (Fenrir.HelperFunctions.unteleportableMaps.indexOf(this.mapId()) !== -1);
};

Game_Map.prototype.isOverworldMap = function() {
  return (Fenrir.HelperFunctions.overworldMaps.indexOf(this.mapId()) !== -1);
};
