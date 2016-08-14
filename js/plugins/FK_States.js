/** @class Game_State */
function Game_State() {
  this.initialize.apply(this, arguments);
}

/**
 * @function
 * @param {number} id - The state's ID as in the database.
 * @param {object} owner - The battler that gains this state.
 */
Game_State.prototype.initialize = function(id, owner) {
  this.initMembers();
  this.setup(id);
  this.owner = owner;
}

/**
 * @function
 */
Game_State.prototype.initMembers = function() {
  this.id                  = 0;
  this.owner               = null;
  this.baseState           = null;
  this.name                = "";
  this.iconIndex           = 0;
  this.duration            = 0;
  this.motion              = 0;
  this.overlay             = 0;
  this.priority            = 0;
  this.releaseByDamage     = false;
  this.removeAtBattleEnd   = false;
  this.removeByDamage      = false;
  this.removeByRestriction = false;
  this.removeByWalking     = false;
  this.restriction         = 0;
  this.stepsToRemove       = 0;
  this.traits              = [];
}

/**
 * @function
 * @param {number} id - The state's ID as in the database.
 */
Game_State.prototype.setup = function(id) {
  this.id                  = id;
  this.baseState           = $dataStates[this.id];
  this.name                = this.baseState.name;
  this.iconIndex           = this.baseState.iconIndex;
  this.duration            = this.baseState.minTurns + Math.floor(Math.random() * (this.baseState.maxTurns - this.baseState.minTurns));
  this.motion              = this.baseState.motion;
  this.overlay             = this.baseState.overlay;
  this.priority            = this.baseState.priority;
  this.releaseByDamage     = this.baseState.releaseByDamage;
  this.removeAtBattleEnd   = this.baseState.removeAtBattleEnd;
  this.removeByRestriction = this.baseState.removeByRestriction;
  this.removeByWalking     = this.baseState.removeByWalking;
  this.restriction         = this.baseState.restriction;
  this.stepsToRemove       = this.baseState.stepsToRemove;
  this.traits              = [];
  for(let a = 0;a < this.baseState.traits.length;a++) {
    this.traits.push({
      code: this.baseState.traits[a].code,
      dataId: this.baseState.traits[a].dataId,
      value: this.baseState.traits[a].value
    });
  }
}


/** @namespace Game_Battler */
/**
 * @function
 * @param {number} stateId - The ID of the state in the database.
 * @desc Adds a state to this battler.
 */
Game_Battler.prototype.addState = function(stateId) {
  if(this.isStateAddable(stateId)) {
    this.addNewState(stateId);
    this.refresh();
  }
}
