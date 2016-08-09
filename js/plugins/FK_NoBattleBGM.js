var FK = FK || {};
FK.NoBattleBgm = FK.NoBattleBgm || {};

var Imported = Imported || {};
Imported.FK_NoBattleBgm = true;

/*:
@plugindesc Allows the user to disable and enable battle BGM
@author FenrirKnight

@help
Available plugin commands:
EnableBattleBgm
DisableBattleBgm
ToggleBattleBgm
*/

/*
	gameSystem
*/
FK.NoBattleBgm.gameSystem_initialize =
	Game_System.prototype.initialize;
Game_System.prototype.initialize = function() {
	FK.NoBattleBgm.gameSystem_initialize.call(this);
	this._battleBgmEnabled = true;
};


BattleManager.playBattleBgm = function() {
	if($gameSystem._battleBgmEnabled) {
  	AudioManager.playBgm($gameSystem.battleBgm());
  }
  AudioManager.stopBgs();
};

FK.NoBattleBgm.stopAudioOnBattleStart =
	Scene_Map.prototype.stopAudioOnBattleStart;
Scene_Map.prototype.stopAudioOnBattleStart = function() {
    if($gameSystem._battleBgmEnabled) {
    	FK.NoBattleBgm.stopAudioOnBattleStart.call(this);
    }
};

// Adjust Yanfly's Victory Aftermath processNormalVictory
if(Yanfly && Yanfly.VA) {
	BattleManager.processNormalVictory = function() {
	  if (!$gameSystem.skipVictoryMusic() && $gameSystem._battleBgmEnabled) this.playVictoryMe();
	  this.makeRewards();
	  this.startVictoryPhase();
	};
}
// Adjust default processVictory
else {
	BattleManager.processVictory = function() {
    $gameParty.removeBattleStates();
    $gameParty.performVictory();
    if($gameSystem._battleBgmEnabled) {
	    this.playVictoryMe();
	    this.replayBgmAndBgs();
	  }
    this.makeRewards();
    this.displayVictoryMessage();
    this.displayRewards();
    this.gainRewards();
    this.endBattle(0);
	};
}



// Enable plugin commands
FK.NoBattleBgm.Game_Interpreter_pluginCommand =
	Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
	FK.NoBattleBgm.Game_Interpreter_pluginCommand.call(this, command, args);
	if(command === "EnableBattleBgm")	$gameSystem._battleBgmEnabled = true;
	if(command === "DisableBattleBgm")	$gameSystem._battleBgmEnabled = false;
	if(command === "ToggleBattleBgm")	$gameSystem._battleBgmEnabled = !$gameSystem._battleBgmEnabled;
};
