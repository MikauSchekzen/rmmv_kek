var Fenrir = Fenrir || {};
Fenrir.Quest = Fenrir.Quest || {};

/*:
 * @plugindesc v0.1
 * @author MikauSchekzen
 *
 * @param === ICONS ===
 *
 * @param Experience icon
 * @desc The icon used for the XP reward
 * @default 79
 *
 * @param Gold icon
 * @desc The icon used for the Gold reward (uses Yanfly's icon if applicable)
 * @default 143
 *
 * @param Completed icon
 * @desc The icon used for completed quests
 * @default 90
 *
 * @param Failed icon
 * @desc The icon used for failed quests
 * @default 91
 *
 * @param === COLORS ===
 *
 * @param Completed color
 * @desc Color to use for the name of completed quests (as per system color)
 * @default 3
 *
 * @param Failed color
 * @desc Color to use for the name of failed quests (as per system color)
 * @default 10
 */


Fenrir.Quest.Parameters = PluginManager.parameters("FK_Quest");
Fenrir.Quest.Icon = Fenrir.Quest.Icon || {};
Fenrir.Quest.Color = Fenrir.Quest.Color || {};

Fenrir.Quest.Icon.Exp = Number(Fenrir.Quest.Parameters["Experience icon"]);
Fenrir.Quest.Icon.Gold = Number(Fenrir.Quest.Parameters["Gold icon"]);
Fenrir.Quest.Icon.Completed = Number(Fenrir.Quest.Parameters["Completed icon"]);
Fenrir.Quest.Icon.Failed = Number(Fenrir.Quest.Parameters["Failed icon"]);

Fenrir.Quest.Color.Completed = Number(Fenrir.Quest.Parameters["Completed color"]);
Fenrir.Quest.Color.Failed = Number(Fenrir.Quest.Parameters["Failed color"]);



DataManager._databaseFiles.push(
  { name: "$dataQuests", src: "Quests.json" }
);


Scene_Menu.prototype.commandQuestLog = function() {
  SceneManager.push(Scene_QuestLog);
};

Fenrir.Quest.Game_Interpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args) {
  if(command.toUpperCase() === "LEARNQUEST") {
    $gameQuests.learnQuest(Number(args[0]));
  }
  else if(command.toUpperCase() === "UNLEARNQUEST" || command.toUpperCase() === "FORGETQUEST") {
    $gameQuests.unlearnQuest(Number(args[0]));
  }
  else if(command.toUpperCase() === "COMPLETEQUEST") {
    $gameQuests.completeQuest(Number(args[0]));
  }
  else if(command.toUpperCase() === "UNCOMPLETEQUEST") {
    $gameQuests.uncompleteQuest(Number(args[0]));
  }
  else if(command.toUpperCase() === "FAILQUEST") {
    $gameQuests.failQuest(Number(args[0]));
  }
  else if(command.toUpperCase() === "UNFAILQUEST") {
    $gameQuests.unfailQuest(Number(args[0]));
  }
  Fenrir.Quest.Game_Interpreter_pluginCommand.call(this, command, args);
};


/**
 * DataManager
 */

Fenrir.Quest.DataManager_createGameObjects = DataManager.createGameObjects;
DataManager.createGameObjects = function() {
  Fenrir.Quest.DataManager_createGameObjects.call(this);
  $gameQuests = new Game_Quests();
};

Fenrir.Quest.DataManager_makeSaveContents = DataManager.makeSaveContents;
DataManager.makeSaveContents = function() {
  var contents = Fenrir.Quest.DataManager_makeSaveContents.call(this);
  contents.quests = $gameQuests;
  return contents;
};

Fenrir.Quest.DataManager_extractSaveContents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents) {
  Fenrir.Quest.DataManager_extractSaveContents.call(this, contents);
  $gameQuests   = contents.quests;
};

var $dataQuests = null;
var $gameQuests = null;


/**
 * Game_Quests
 */
function Game_Quests() {
  this.initialize.apply(this, arguments);
};
Game_Quests.prototype.constructor = Game_Quests;

Game_Quests.prototype.initialize = function() {
  this.initMembers();
};

Game_Quests.prototype.initMembers = function() {
  this._completed = [];
  this._failed = [];
  this._known = [];
};

Game_Quests.prototype.getCompletedQuests = function() {
  return this._completed;
};

Game_Quests.prototype.getFailedQuests = function() {
  return this._failed;
};

Game_Quests.prototype.getKnownQuests = function() {
  return this._known;
};

Game_Quests.prototype.isKnown = function(id) {
  return this._known.indexOf(id) !== -1;
};

Game_Quests.prototype.isFailed = function(id) {
  return this._failed.indexOf(id) !== -1;
};

Game_Quests.prototype.isCompleted = function(id) {
  return this._completed.indexOf(id) !== -1;
};

Game_Quests.prototype.completeQuest = function(id) {
  this.unfailQuest(id);
  this._completed.push(id);
};

Game_Quests.prototype.failQuest = function(id) {
  this.uncompleteQuest(id);
  this._failed.push(id);
};

Game_Quests.prototype.learnQuest = function(id) {
  this._known.push(id);
};

Game_Quests.prototype.uncompleteQuest = function(id) {
  if(this._completed.indexOf(id) !== -1) {
    this._completed.splice(this._completed.indexOf(id), 1);
  }
};

Game_Quests.prototype.unfailQuest = function(id) {
  if(this._failed.indexOf(id) !== -1) {
    this._failed.splice(this._failed.indexOf(id), 1);
  }
};

Game_Quests.prototype.unlearnQuest = function(id) {
  if(this._known.indexOf(id) !== -1) {
    this._known.splice(this._known.indexOf(id), 1);
  }
};


/**
 * Scene_QuestLog
 */

function Scene_QuestLog() {
  this.initialize.apply(this, arguments);
};
Scene_QuestLog.prototype = Object.create(Scene_MenuBase.prototype);
Scene_QuestLog.prototype.constructor = Scene_QuestLog;

Scene_QuestLog.prototype.initialize = function() {
  Scene_MenuBase.prototype.initialize.call(this);
};

Scene_QuestLog.prototype.create = function() {
  Scene_MenuBase.prototype.create.call(this);
  this.createHelpWindow();
  this.createCategoryWindow();
  this.createQuestWindow();
  this.createQuestDescriptionWindow();
  this._questDescriptionWindow.refresh();
};

Scene_QuestLog.prototype.start = function() {
  Scene_MenuBase.prototype.start.call(this);
};

Scene_QuestLog.prototype.createHelpWindow = function() {
  this._helpWindow = new Window_Help(1);
  this._helpWindow.x = 288;
  this._helpWindow.width = Graphics.boxWidth-288;
  this.addWindow(this._helpWindow);
};

Scene_QuestLog.prototype.createCategoryWindow = function() {
  this._categoryWindow = new Window_QuestCategory();
  this._categoryWindow.setHelpWindow(this._helpWindow);
  this._categoryWindow.setHandler("ok", this.onCategoryOk.bind(this));
  this._categoryWindow.setHandler("cancel", this.popScene.bind(this));
  this.addWindow(this._categoryWindow);
};

Scene_QuestLog.prototype.createQuestWindow = function() {
  this._questWindow = new Window_QuestItem(this._categoryWindow);
  this._categoryWindow._questWindow = this._questWindow;
  this._questWindow.y = this._categoryWindow.height;
  this._questWindow.setHandler("ok", this.onQuestOk.bind(this));
  this._questWindow.setHandler("cancel", this.onQuestCancel.bind(this));
  this._questWindow.deactivate();
  this.addWindow(this._questWindow);
};

Scene_QuestLog.prototype.createQuestDescriptionWindow = function() {
  this._questDescriptionWindow = new Window_QuestDescription(this._helpWindow.height);
  this._questDescriptionWindow._questWindow = this._questWindow;
  this._questWindow._questDescriptionWindow = this._questDescriptionWindow;
  this._categoryWindow._questDescriptionWindow = this._questDescriptionWindow;
  this._questDescriptionWindow.setHandler("cancel", this.onDescriptionCancel.bind(this));
  this._questDescriptionWindow.deactivate();
  this.addWindow(this._questDescriptionWindow);
};

Scene_QuestLog.prototype.onCategoryOk = function() {
  this._questWindow.activate();
};

Scene_QuestLog.prototype.onQuestOk = function() {
  this._questDescriptionWindow.activate();
};

Scene_QuestLog.prototype.onQuestCancel = function() {
  this._categoryWindow.activate();
};

Scene_QuestLog.prototype.onDescriptionCancel = function() {
  this._questWindow.activate();
};


/**
 * Window_QuestCategory
 */

function Window_QuestCategory() {
  this.initialize.apply(this, arguments);
};
Window_QuestCategory.prototype = Object.create(Window_HorzCommand.prototype);
Window_QuestCategory.prototype.constructor = Window_QuestCategory;

Window_QuestCategory.prototype.initialize = function() {
  Window_HorzCommand.prototype.initialize.call(this, 0, 0);
};

Window_QuestCategory.prototype.windowWidth = function() {
  return 288;
};

Window_QuestCategory.prototype.maxCols = function() {
  return 5;
};

Window_QuestCategory.prototype.callUpdateHelp = function() {
  if(this._helpWindow) {
    var index = this.index();
    var item = this._list[index];
    var desc = "";
    if($dataQuests.types[item.symbol]) {
      desc = $dataQuests.types[item.symbol].name;
    } else {
      switch(item.symbol) {
        case "special_completed":
        desc = "Completed Quests";
        break;
        case "special_failed":
        desc = "Failed Quests";
        break;
      }
    }
    this._helpWindow.setText(desc);
  }
};

Window_QuestCategory.prototype.select = function(index) {
  var lastIndex = this._index;
  Window_HorzCommand.prototype.select.call(this, index);
  if(this._questWindow && this._index !== lastIndex) {
    this._questWindow._index = 0;
    this._questWindow.refresh();
    this._questWindow.updateCursor();
    this._questDescriptionWindow.refresh();
  }
};

Window_QuestCategory.prototype.makeCommandList = function() {
  for(var a in $dataQuests.types) {
    var type = $dataQuests.types[a];
    this.addCommand("", a);
  }
  this.addCommand("", "special_completed");
  this.addCommand("", "special_failed");
};

Window_QuestCategory.prototype.drawItem = function(index) {
  var rect = this.itemRectForText(index);
  this.resetTextColor();
  this.changePaintOpacity(this.isCommandEnabled(index));
  var type = $dataQuests.types[this._list[index].symbol];
  if(type) {
    this.drawIcon(type.icon, rect.x + (rect.width / 2) - (Window_Base._iconWidth / 2), rect.y + (rect.height / 2) - (Window_Base._iconHeight / 2));
  } else {
    var icon = 0;
    switch(this._list[index].symbol) {
      case "special_completed":
      icon = Fenrir.Quest.Icon.Completed;
      break;
      case "special_failed":
      icon = Fenrir.Quest.Icon.Failed;
      break;
    }
    this.drawIcon(icon, rect.x + (rect.width / 2) - (Window_Base._iconWidth / 2), rect.y + (rect.height / 2) - (Window_Base._iconHeight / 2));
  }
};


/**
 * Window_QuestItem
 */

function Window_QuestItem() {
  this.initialize.apply(this, arguments);
};
Window_QuestItem.prototype = Object.create(Window_Command.prototype);
Window_QuestItem.prototype.constructor = Window_QuestItem;

Window_QuestItem.prototype.initialize = function(categoryWindow) {
  this._categoryWindow = categoryWindow;
  Window_Command.prototype.initialize.call(this, 0, 0);
};

Window_QuestItem.prototype.windowWidth = function() {
  return 288;
};

Window_QuestItem.prototype.windowHeight = function() {
  return Graphics.boxHeight - this._categoryWindow.windowHeight();
};

Window_QuestItem.prototype.maxRows = function() {
  return 10;
};

Window_QuestItem.prototype.makeCommandList = function() {
  var arr = $dataQuests.quests.filter(this.questFilter, this);
  for(var a = 0;a < arr.length;a++){
    var q = arr[a];
    this.addCommand(q.name, q.id.toString(), true, {
      quest: q
    });
  }
};

Window_QuestItem.prototype.questFilter = function(value) {
  if($gameQuests.isKnown(value.id)) {
    switch(this.categorySymbol()) {
      case "special_completed":
      return $gameQuests.isCompleted(value.id);
      break;
      case "special_failed":
      return $gameQuests.isFailed(value.id);
      break;
      default:
      return (!$gameQuests.isCompleted(value.id) && !$gameQuests.isFailed(value.id) && value.type == this.categorySymbol());
      break;
    }
  }
  return false;
};

Window_QuestItem.prototype.updateCursor = function() {
  Window_Command.prototype.updateCursor.call(this);
  if(this._questDescriptionWindow) {
    this._questDescriptionWindow.resetScroll();
    this._questDescriptionWindow.refresh();
  }
};

Window_QuestItem.prototype.categorySymbol = function() {
  return this._categoryWindow.commandSymbol(this._categoryWindow.index());
};

Window_QuestItem.prototype.drawItem = function(index) {
  var rect = this.itemRectForText(index);
  this.resetTextColor();
  this.changePaintOpacity(this.isCommandEnabled(index));
  var q = this._list[index].ext.quest;
  this.drawIcon(q.icon, rect.x - 4, rect.y + (rect.height / 2) - (Window_Base._iconHeight / 2));
  if($gameQuests.isFailed(q.id)) {
    this.changeTextColor(this.textColor(Fenrir.Quest.Color.Failed));
  } else if($gameQuests.isCompleted(q.id)) {
    this.changeTextColor(this.textColor(Fenrir.Quest.Color.Completed));
  }
  this.drawText(q.name, rect.x + Window_Base._iconWidth, rect.y, rect.width - Window_Base._iconWidth, "left");
};


/**
 * Window_QuestDescription
 */
function Window_QuestDescription() {
  this.initialize.apply(this, arguments);
};
Window_QuestDescription.prototype = Object.create(Window_Selectable.prototype);
Window_QuestDescription.prototype.constructor = Window_QuestDescription;

Window_QuestDescription.prototype.initialize = function(y) {
  this.initMembers();
  var width = Graphics.boxWidth - 288;
  var height = Graphics.boxHeight - y;
  Window_Selectable.prototype.initialize.call(this, 288, y, width, height);
};

Window_QuestDescription.prototype.initMembers = function() {
  this._scrollVert = 0;
  this._bufferY = 0;
};

Window_QuestDescription.prototype.drawAllItems = function() {
  if(this._questWindow) {
    var rect = this.itemRect(0);
    this._bufferY = 0;
    // Draw stuff
    this.drawTextEx(this.description(), rect.x, rect.y - this._scrollVert);
    this.addRewardSection();
  }
};

Window_QuestDescription.prototype.maxCols = function() {
  return 1;
};

Window_QuestDescription.prototype.maxRows = function() {
  return 1;
};

Window_QuestDescription.prototype.cursorUp = function() {
  this._scrollVert = (this._scrollVert - this.scrollSpeed()).clamp(0, Math.max(0, this.contentHeight() - this.contents.height));
  this.refresh();
};

Window_QuestDescription.prototype.cursorDown = function() {
  this._scrollVert = (this._scrollVert + this.scrollSpeed()).clamp(0, Math.max(0, this.contentHeight() - this.contents.height));
  this.refresh();
};

Window_QuestDescription.prototype.contentHeight = function() {
  return this.descriptionHeight() + this._bufferY;
};

Window_QuestDescription.prototype.descriptionHeight = function() {
  var desc = this.description();
  var arr = desc.split(/[\n\r]/);
  return (arr.length + 1) * this.lineHeight();
};

Window_QuestDescription.prototype.scrollSpeed = function() {
  return 24;
};

Window_QuestDescription.prototype.resetScroll = function() {
  Window_Selectable.prototype.resetScroll.call(this);
  this._scrollVert = 0;
};

Window_QuestDescription.prototype.description = function() {
  var ext = this._questWindow.currentExt();
  if(ext) {
    return ext.quest.description;
  }
  return "";
};

Window_QuestDescription.prototype.addRewardSection = function() {
  var ext = this._questWindow.currentExt();
  if(ext) {
    var q = ext.quest;
    var rewards = q.rewards;
    if(rewards) {
      this._bufferY += this.lineHeight() * 3;
      this.drawText("=== Expected Rewards ===", 0, this.contentHeight() - (this.lineHeight() * 2), this.contents.width, "center")
      for(var a = 0;a < rewards.length;a++) {
        var reward = rewards[a];
        this._bufferY += this.lineHeight();
        switch(reward.type) {
          case "gold":
          var icon = Fenrir.Quest.Icon.Gold;
          if(Yanfly && Yanfly.Icon && Yanfly.Icon.Gold) {
            icon = Yanfly.Icon.Gold;
          }
          this.drawIcon(Yanfly.Icon.Gold, this.contents.width - Window_Base._iconWidth, this.contentHeight() - this.lineHeight());
          this.drawText("Wealth", 0, this.contentHeight() - this.lineHeight());
          this.drawText(reward.value.toString(), 0, this.contentHeight() - this.lineHeight(), this.contents.width - Window_Base._iconWidth, "right");
          break;

          case "exp":
          this.drawIcon(Fenrir.Quest.Icon.Exp, this.contents.width - Window_Base._iconWidth, this.contentHeight() - this.lineHeight());
          this.drawText("Exp", 0, this.contentHeight() - this.lineHeight());
          this.drawText(reward.value.toString(), 0, this.contentHeight() - this.lineHeight(), this.contents.width - Window_Base._iconWidth, "right");
          break;

          case "item":
          var item = $dataItems[reward.id];
          this.drawIcon(item.iconIndex, this.contents.width - Window_Base._iconWidth, this.contentHeight() - this.lineHeight());
          this.drawText(item.name, 0, this.contentHeight() - this.lineHeight());
          this.drawText("x" + reward.value.toString(), 0, this.contentHeight() - this.lineHeight(), this.contents.width - Window_Base._iconWidth, "right");
          break;

          case "weapon":
          var item = $dataWeapons[reward.id];
          this.drawIcon(item.iconIndex, this.contents.width - Window_Base._iconWidth, this.contentHeight() - this.lineHeight());
          this.drawText(item.name, 0, this.contentHeight() - this.lineHeight());
          this.drawText("x" + reward.value.toString(), 0, this.contentHeight() - this.lineHeight(), this.contents.width - Window_Base._iconWidth, "right");
          break;

          case "armor":
          var item = $dataArmors[reward.id];
          this.drawIcon(item.iconIndex, this.contents.width - Window_Base._iconWidth, this.contentHeight() - this.lineHeight());
          this.drawText(item.name, 0, this.contentHeight() - this.lineHeight());
          this.drawText("x" + reward.value.toString(), 0, this.contentHeight() - this.lineHeight(), this.contents.width - Window_Base._iconWidth, "right");
          break;

          case "custom":
          this.drawText(" - " + reward.value, 0, this.contentHeight() - this.lineHeight(), this.contents.width, "left");
          break;
        }
      }
    }
  }
};
