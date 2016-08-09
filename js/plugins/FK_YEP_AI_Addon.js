var FK = FK || {};
FK.YEP_AI_Addon = FK.YEP_AI_Addon || {};

/*:
 * @author FenrirKnight
 * @plugindesc v0.2
 *
 * @help
 * Adds more things to Yanfly's AI Plugin to control the AI of your enemies.
 *
 * =====================================
 * New Conditions
 * =====================================
 *
 * The following is a list of ways you can format your conditions for the enemy
 * to choose the right skill. In addition to deciding whether or not the skill
 * will be used, the condition also selects the enemy target. The following
 * list will tell you how the conditions are met and what targets will be
 * selected for battle.
 *
 * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 * EVALEXT eval
 * - - - - - - - - - - - - - - - - - - -
 * This allows you to use any kind of code to check and fulfill a condition.
 * This condition uses all members of the skill's scope individually
 * and allows the variable 'target'.
 * - - - - - - - - - - - - - - - - - - -
 * Example:  EvalExt target.hp >= 500: Skill 1, Highest HP%
 * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 *
 * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 * EVALEXT2 eval; eval2
 * - - - - - - - - - - - - - - - - - - -
 * This allows you to use any kind of code to check and fulfill a condition.
 * Replace 'eval' with code that runs once, and 'eval2' for code that runs
 * for each individual target as per EvalExt.
 * - - - - - - - - - - - - - - - - - - -
 * Example:  EvalExt2 Math.random() < 0.3; target.hp >= 500: Skill 1, Highest HP%
 * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 *
*/



FK.YEP_AI_Addon.AIManager_passAIConditions = AIManager.passAIConditions;
AIManager.passAIConditions = function(line) {
  // EXT EVAL
  if(line.match(/EVALEXT[ ](.*)/i)) {
    var condition = String(RegExp.$1.trim());
    return this.conditionEvalExt(condition);
  }
  else if(line.match(/EVALEXT2[ ](.*)\;[ ]?(.*)/i)) {
    var conditions = [String(RegExp.$1.trim()), String(RegExp.$2.trim())];
    var results = [this.conditionEval(conditions[0]), this.conditionEvalExt(conditions[1])];
    return (results.indexOf(false) === -1);
  }
  return FK.YEP_AI_Addon.AIManager_passAIConditions.call(this, line);
};


AIManager.conditionEvalExt = function(condition) {
    var action = this.action();
    var item = action.item();
    var user = this.battler();
    var s = $gameSwitches._data;
    var v = $gameVariables._data;

    var group = this.getActionGroup();
    var finalGroup = [];
    for(var a = 0;a < group.length;a++) {
      var target = group[a];
      if(eval(condition)) {
        finalGroup.push(target);
      }
    }
    if(finalGroup.length === 0) return false;
    this.setProperTarget(finalGroup);
    return true;
};
