var Imported = Imported || {};
Imported.FK_YEP_AugmentMod = true;

var Fenrir = Fenrir || {};
Fenrir.YEP_AugmentMod = Fenrir.YEP_AugmentMod || {};

/*:
 * @plugindesc v0.1 Mods Yanfly's Attachable Augments with some more functionality
 * @author FenrirKnight
 *
 * @help
 * ============================================================================
 * Introduction
 * ============================================================================
 *
 * This plugin requires YEP_X_AttachAugments.
 * Make sure this plugin is located under YEP_X_AttachAugments in the plugin list.
 *
 * ============================================================================
 * Notetags
 * ============================================================================
 *
 * The following is a list of effects you can use for the <Augment: type>,
 * <Augment Attach: type>, <Augment Detatch: type> notetags to have it apply
 * the desired effects to the upgraded item.
 *
 * --- Effects ---
 *
 * Item, Weapon and Armor Notetags
 *
 * <Destroy on Detach>
 * This will destroy the augment on being detached.
 */

Fenrir.YEP_AugmentMod.DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function() {
  if(!Fenrir.YEP_AugmentMod.DataManager_isDatabaseLoaded.call(this)) return false;

  this.processFKAugmentNotetags1($dataItems);
  this.processFKAugmentNotetags1($dataWeapons);
  this.processFKAugmentNotetags1($dataArmors);

  return true;
}

DataManager.processFKAugmentNotetags1 = function(group) {
  for(var a = 1;a < group.length;a++) {
    var obj = group[a];
    var notedata = obj.note.split(/[\r\n]+/);

    obj._augmentDestroyOnDetach = false;

    for(var b = 0;b < notedata.length;b++) {
      var line = notedata[b];

      if(line.match(/<DESTROY ON DETACH>/i)) {
        obj._augmentDestroyOnDetach = true;
      }
    }
  }
}


//=================================================
// ItemManager
//=================================================

ItemManager.applyAugmentEffects = function(item, effectItem, slotId, gain) {
    if (!item) return;
    gain = gain || 0;
    this.checkAugmentSlots(item);
    if (item.augmentSlotItems[slotId] !== 'none') {
      var augment = this.removeAugmentFromSlot(item, slotId);
      if (augment && !augment._augmentDestroyOnDetach) $gameParty.gainItem(augment, gain);
    }
    this.installAugmentToSlot(item, effectItem, slotId);
    $gameParty.loseItem(effectItem, gain);
    this.augmentRefreshParty(item);
}

// Fenrir.YEP_AugmentMod.ItemManager_processAugmentEffect = ItemManager.processAugmentEffect;
// ItemManager.processAugmentEffect = function(line, mainItem, effectItem, slot) {
//   // DETACH DESTROY
//   if(line.match(/DESTROY AUGMENT/i)) {
//     return $gameParty.loseItem(effectItem, 1);
//   }
//   return Fenrir.YEP_AugmentMod.ItemManager_processAugmentEffect.call(this, line, mainItem, effectItem, slot);
// }

// DataManager.processFKAugmentNotetags1 = function(group) {
//   Fenrir.YEP_AugmentMod.attachAugmentEffect = {};
//   Fenrir.YEP_AugmentMod.detachAugmentEffect = {};
//
//   for(var a = 1;a < group.length;a++) {
//     var obj = group[a];
//     var notedata = obj.note.split(/[\n\r]+/);
//
//     for(var b = 0;b < notedata.length;b++) {
//       var line = notedata[b];
//       var evalMode = "none";
//       var augmentType = "none";
//
//       if(line.match(/<AUGMENT ATTACH EFFECT:[ ](.*)>/i)) {
//         evalMode = "augment-attach-effect";
//         augmentType = String(RegExp.$1).toUpperCase().trim();
//           Fenrir.YEP_AugmentMod.attachAugmentEffect[a] = Fenrir.YEP_AugmentMod.attachAugmentEffect[a] || {};
//         Fenrir.YEP_AugmentMod.attachAugmentEffect[a][augmentType] = "";
//       }
//       else if(line.match(/<\/AUGMENT ATTACH EFFECT:[ ](.*)>/i)) {
//         evalMode = "none";
//         augmentType = "none";
//       }
//       else if(line.match(/<AUGMENT DETACH EFFECT:[ ](.*)>/i)) {
//         evalMode = "augment-detach-effect";
//         augmentType = String(RegExp.$1).toUpperCase().trim();
//         Fenrir.YEP_AugmentMod.detachAugmentEffect[a] = Fenrir.YEP_AugmentMod.detachAugmentEffect[a] || {};
//         Fenrir.YEP_AugmentMod.detachAugmentEffect[a][augmentType] = "";
//       }
//       else if(line.match(/<\/AUGMENT DETACH EFFECT:[ ](.*)>/i)) {
//         evalMode = "none";
//         augmentType = "none";
//       }
//       else if(evalMode === "augment-detach-effect") {
//         Fenrir.YEP_AugmentMod.attachAugmentEffect[a][augmentType] += line;
//       }
//       else if(evalMode === "augment-detach-effect") {
//         Fenrir.YEP_AugmentMod.detachAugmentEffect[a][augmentType] += line;
//       }
//     }
//   }
// }
//
// Fenrir.YEP_AugmentMod.ItemManager_installAugmentToSlot = ItemManager.installAugmentToSlot;
// ItemManager.installAugmentToSlot = function(item, effectItem, slotId) {
//   this.processFenrirAugmentMod_AttachEffect(item, effectItem);
//   return Fenrir.YEP_AugmentMod.ItemManager_installAugmentToSlot.call(this, item, effectItem, slotId);
// }
//
// Fenrir.YEP_AugmentMod.ItemManager_removeAugmentFromSlot = ItemManager.removeAugmentFromSlot;
// ItemManager.removeAugmentFromSlot = function(item, slotId) {
//   var augment = this.augmentInSlot(item, slotId);
//   if(augment) this.processFenrirAugmentMod_DetachEffect(item, augment);
//   return Fenrir.YEP_AugmentMod.ItemManager_removeAugmentFromSlot.call(this, item, slotId);
// }
//
// ItemManager.processFenrirAugmentMod_AttachEffect = function(item, effectItem) {
//   if(!item || !effectItem) return;
//   if(Fenrir.YEP_AugmentMod.attachAugmentEffect[effectItem.id]) {
//     eval(Fenrir.YEP_AugmentMod.attachAugmentEffect[effectItem.id]);
//   }
// }
//
// ItemManager.processFenrirAugmentMod_DetachEffect = function(item, effectItem) {
//   if(!item || !effectItem) return;
//   if(Fenrir.YEP_AugmentMod.detachAugmentEffect[effectItem.id] && Fenrir.YEP_AugmentMod.detachAugmentEffect[effectItem.id]) {
//     eval(Fenrir.YEP_AugmentMod.detachAugmentEffect[effectItem.id]);
//   }
// }
