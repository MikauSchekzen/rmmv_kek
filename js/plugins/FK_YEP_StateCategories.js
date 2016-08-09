var Imported = Imported || {};
Imported.FK_YEP_StateCategories = true;

var Fenrir = Fenrir || {};
Fenrir.YEP_StateCategories = Fenrir.YEP_StateCategories || {};

/*:
 * @plugindesc v0.1 Adds additional helper functions to Yanfly's State Categories.
 * @author FenrirKnight
 */


Game_Battler.prototype.getStatesByCategory = function(c) {
  var states = [];
  for (var i = 0; i < this._states.length; ++i) {
    var id = this._states[i];
    var state = $dataStates[id];
    if (!state) continue;
    if (state.category.contains(c.toUpperCase())) states.push(state);
  }
  return states;
}
