var FK = FK || {};
FK.YEP_AI_Addon = FK.YEP_AI_Addon || {};

var Imported = Imported || {};
Imported.FK_YEP_AI_Addon = true;

/*:
 * @author FenrirKnight
 * @plugindesc v0.2
 *
 * @param === RegExp ===
 *
 * @param Open tag
 * @desc The opening tag for delimiters.
 * @default <delim>
 *
 * @param Close tag
 * @desc The closing tag for delimiters
 * @default <\\delim>
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
 * EVALTARGET eval
 * - - - - - - - - - - - - - - - - - - -
 * This allows you to use any kind of code to check and fulfill a condition.
 * This condition uses all members of the skill's scope individually
 * and allows the variable 'target'.
 * - - - - - - - - - - - - - - - - - - -
 * Example:  EvalTarget target.hpRate() >= user.mpRate(): Skill 1, Highest HP%
 * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=
 *
 * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
 * USER stat PARAM eval
 *- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Replace 'stat' with either 'atk', 'def', 'mat', 'mdf', 'agi', 'luk',
 * 'maxhp', 'maxmp', 'hp', 'mp', 'hp%', 'mp%', or 'level' to run it in a
 * condition check again to see if the action gets passed.
 *- - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
 * Example:   User HP% param <= 50%: Recklessness
 *            User Level param >= 6: Fear, Highest ATK
 * =-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-=-
*/

FK.YEP_AI_Addon.Parameters = PluginManager.parameters("FK_YEP_AI_Addon");

FK.YEP_AI_Addon.RegExp = {
  delimiterOpen: new RegExp(FK.YEP_AI_Addon.Parameters["Open tag"], "ig"),
  delimiterClose: new RegExp(FK.YEP_AI_Addon.Parameters["Close tag"], "ig"),
  operators: /[ ](&&|AND|\|\||OR)[ ]/ig
};


FK.YEP_AI_Addon.AIManager_passAIConditions = AIManager.passAIConditions;
AIManager.passAIConditions = function(line) {
  var obj = this._createConditionArray(line);
  var result = this._examineConditionArray(obj, "whole");
  // var result = true;
  return result;
}

AIManager._createConditionArray = function(line) {
  var reOpen = FK.YEP_AI_Addon.RegExp.delimiterOpen;
  var reClose = FK.YEP_AI_Addon.RegExp.delimiterClose;
  var reOperators = FK.YEP_AI_Addon.RegExp.operators;
  // Phase 1: Gather open/close/operator tags
  var result = [];
  var arr;
  while((arr = reOpen.exec(line)) !== null) {
    result.push({ index: arr.index, str: arr[0], type: "open" });
  }
  while((arr = reClose.exec(line)) !== null) {
    result.push({ index: arr.index, str: arr[0], type: "close" });
  }
  while((arr = reOperators.exec(line)) !== null) {
    result.push({ index: arr.index, str: arr[0], type: "operator" });
  }
  result.sort(function(a, b) {
    if(a.index < b.index) return -1;
    if(a.index > b.index) return 1;
    return 0;
  });
  // Phase 2: Generate content
  var _stack = [[]];
  // Check for starting content
  if(result.length > 0 && result[0].index > 0) _stack[0].push(line.slice(0, result[0].index).trim());
  // Check for only content
  else if(result.length === 0) _stack[0].push(line);
  // Check for additional content
  for(var a = 0;a < result.length;a++) {
    var obj = result[a];
    // Open
    if(obj.type === "open") {
      var arr = [];
      _stack.push(arr);
    }
    // Close
    else if(obj.type === "close") {
      var arr = _stack.pop();
      if(_stack.length > 0) _stack[_stack.length-1].push(arr);
    }
    // Operator
    else if(obj.type === "operator") {
      _stack[_stack.length-1].push(obj.str);
    }
    // Check for content
    if(result.length > a+1 && obj.index + obj.str.length <= result[a+1].index) {
      var content = line.slice(obj.index + obj.str.length, result[a+1].index).trim();
      if(content.length > 0) _stack[_stack.length-1].push(content);
    }
    else if(result.length === a+1) {
      var content = line.slice(obj.index + obj.str.length).trim();
      if(content.length > 0) _stack[_stack.length-1].push(content);
    }
  }
  return _stack[0];
}

AIManager._examineConditionArray = function(arr, type) {
  var results = [null];
  for(var a = 0;a < arr.length;a++) {
    var obj = arr[a];
    // Object is string
    if(typeof obj === "string") {
      // Operator AND
      if((obj.trim() === "&&" || obj.trim().toUpperCase() === "AND") && results[results.length-1] === false) {
        // If last result was false, skip next item
        a++;
      }
      // Operator OR
      else if(obj.trim() === "||" || obj.trim().toUpperCase() === "OR") {
        // Begin new result line
        results.push(null);
      }
      // Otherwise, it should be a condition
      else {
        results[results.length-1] = AIManager.FK_passAIConditions.call(this, obj);
        console.log(obj);
      }
    }
    // Object is array
    else if(obj instanceof Array) {
      results[results.length-1] = this._examineConditionArray(obj, type);
    }
  }
  // Return result
  return (results.indexOf(true) !== -1);
}

AIManager.FK_passAIConditions = function(line) {
  if(FK.YEP_AI_Addon.AIManager_passAIConditions.call(this, line)) return true;
  // EVAL TARGET
  if(line.match(/EVALTARGET[ ](.*)/i)) {
    return this.conditionEvalTarget();
  }
  // USER PARAM EVAL
  if (line.match(/USER[ ](.*)[ ]PARAM[ ](.*)/i)) {
    var paramId = this.getParamId(String(RegExp.$1));
    var condition = String(RegExp.$2);
    return this.conditionUserParamEval(paramId, condition);
  }
  return false;
}

AIManager.conditionEvalTarget = function(condition) {
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
}

AIManager.conditionUserParamEval = function(paramId, condition) {
  var action = this.action();
  var item = action.item();
  var user = this.battler();
  var s = $gameSwitches._data;
  var v = $gameVariables._data;
  condition = condition.replace(/(\d+)([%％])/g, function() {
    return this.convertIntegerPercent(parseInt(arguments[1]));
  }.bind(this));
  if (paramId < 0) return false;
  if (paramId >= 0 && paramId <= 7) {
    condition = 'user.param(paramId) ' + condition;
  } else if (paramId === 8) {
    condition = 'user.hp ' + condition;
  } else if (paramId === 9) {
    condition = 'user.mp ' + condition;
  } else if (paramId === 10) {
    condition = 'user.hp / user.mhp ' + condition;
  } else if (paramId === 11) {
    condition = 'user.mp / user.mmp ' + condition;
  } else if (paramId === 12) {
    condition = 'user.level ' + condition;
  }
  if(!eval(condition)) return false;
  var group = this.getActionGroup();
  this.setProperTarget(group);
  return true;
}
