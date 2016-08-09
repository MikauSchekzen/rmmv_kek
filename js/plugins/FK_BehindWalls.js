var FK = FK || {};
FK.BWalls = FK.BWalls || {};

var Imported = Imported || {};
Imported.BWalls = true;

/*:
@author MikauSchekzen

@param   Over Region Pass
@desc    The Region ID for the depth tiles that should be passable as well.
@default 1

@param   Over Region No Pass
@desc    The Region ID for non-passable tiles, no matter what, that are over the player.
@default 2

@param   Region No Pass
@desc    The Region ID for non-passable tiles, no matter what.
@default 3
*/


FK.BWalls.Parameters       = PluginManager.parameters("FK_BehindWalls");

FK.BWalls.overRegionPass   = Number(FK.BWalls.Parameters["Over Region Pass"]);
FK.BWalls.overRegionNoPass = Number(FK.BWalls.Parameters["Over Region No Pass"]);
FK.BWalls.regionNoPass     = Number(FK.BWalls.Parameters["Region No Pass"]);

Game_Map.prototype.checkPassage = function(x, y, bit) {
  var regionId = this.regionId(x, y);
  if(regionId === FK.BWalls.overRegionPass)  // Auto Passage
    return true;
  else if(regionId === FK.BWalls.overRegionNoPass || regionId === FK.BWalls.regionNoPass)  // Auto Block
    return false;
  var flags = this.tilesetFlags();
  var tiles = this.allTiles(x, y);
  for (var i = 0; i < tiles.length; i++) {
    var flag = flags[tiles[i]];
    if ((flag & 0x10) !== 0)  // [*] No effect on passage
      continue;
    if ((flag & bit) === 0)   // [o] Passable
      return true;
    if ((flag & bit) === bit) // [x] Impassable
      return false;
  }
  return false;
}

Tilemap.prototype._paintTiles = function(startX, startY, x, y) {
   var tableEdgeVirtualId = 10000;
   var mx                 = startX + x;
   var my                 = startY + y;
   var dx                 = (mx * this._tileWidth).mod(this._layerWidth);
   var dy                 = (my * this._tileHeight).mod(this._layerHeight);
   var lx                 = dx / this._tileWidth;
   var ly                 = dy / this._tileHeight;
   var tileId0            = this._readMapData(mx, my, 0);
   var tileId1            = this._readMapData(mx, my, 1);
   var tileId2            = this._readMapData(mx, my, 2);
   var tileId3            = this._readMapData(mx, my, 3);
   var shadowBits         = this._readMapData(mx, my, 4);
   var upperTileId1       = this._readMapData(mx, my - 1, 1);
   var lowerTiles         = [];
   var upperTiles         = [];

   if (this._isHigherTile(tileId0) || this.isHigherTile2(tileId0, mx, my)) {
       upperTiles.push(tileId0);
   } else {
       lowerTiles.push(tileId0);
   }
   if (this._isHigherTile(tileId1) || this.isHigherTile2(tileId1, mx, my)) {
       upperTiles.push(tileId1);
   } else {
       lowerTiles.push(tileId1);
   }

   lowerTiles.push(-shadowBits);

   if (this._isTableTile(upperTileId1) && !this._isTableTile(tileId1)) {
       if (!Tilemap.isShadowingTile(tileId0)) {
           lowerTiles.push(tableEdgeVirtualId + upperTileId1);
       }
   }

   if (this._isOverpassPosition(mx, my)) {
       upperTiles.push(tileId2);
       upperTiles.push(tileId3);
   } else {
       if (this._isHigherTile(tileId2) || this.isHigherTile2(tileId2, mx, my)) {
           upperTiles.push(tileId2);
       } else {
           lowerTiles.push(tileId2);
       }
       if (this._isHigherTile(tileId3) || this.isHigherTile2(tileId3, mx, my)) {
           upperTiles.push(tileId3);
       } else {
           lowerTiles.push(tileId3);
       }
   }

   var count = 1000 + this.animationCount - my;
   var frameUpdated = (count % 30 === 0);
   this._animationFrame = Math.floor(count / 30);

   var lastLowerTiles = this._readLastTiles(0, lx, ly);
   if (!lowerTiles.equals(lastLowerTiles) ||
           (Tilemap.isTileA1(tileId0) && frameUpdated)) {
       this._lowerBitmap.clearRect(dx, dy, this._tileWidth, this._tileHeight);
       for (var i = 0; i < lowerTiles.length; i++) {
           var lowerTileId = lowerTiles[i];
           if (lowerTileId < 0) {
               this._drawShadow(this._lowerBitmap, shadowBits, dx, dy);
           } else if (lowerTileId >= tableEdgeVirtualId) {
               this._drawTableEdge(this._lowerBitmap, upperTileId1, dx, dy);
           } else {
               this._drawTile(this._lowerBitmap, lowerTileId, dx, dy);
           }
       }
       this._writeLastTiles(0, lx, ly, lowerTiles);
   }

   var lastUpperTiles = this._readLastTiles(1, lx, ly);
   if (!upperTiles.equals(lastUpperTiles)) {
       this._upperBitmap.clearRect(dx, dy, this._tileWidth, this._tileHeight);
       for (var j = 0; j < upperTiles.length; j++) {
           this._drawTile(this._upperBitmap, upperTiles[j], dx, dy);
       }
       this._writeLastTiles(1, lx, ly, upperTiles);
   }
}

Tilemap.prototype.isHigherTile2 = function(tileId, x, y) {
  return ($gameMap && ($gameMap.regionId(x, y) === FK.BWalls.overRegionNoPass || $gameMap.regionId(x, y) === FK.BWalls.overRegionPass));
}
