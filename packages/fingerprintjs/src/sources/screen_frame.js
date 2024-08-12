'use strict';
Object.defineProperty( exports, '__esModule', { value: true } );
exports.getRoundedScreenFrame =
	exports.getScreenFrame =
	exports.hasScreenFrameBackup =
	exports.resetScreenFrameWatch =
	exports.screenFrameCheckInterval =
		void 0;
var tslib_1 = require( 'tslib' );
var browser_1 = require( '../utils/browser' );
var data_1 = require( '../utils/data' );
exports.screenFrameCheckInterval = 2500;
var roundingPrecision = 10;
// The type is readonly to protect from unwanted mutations
var screenFrameBackup;
var screenFrameSizeTimeoutId;
/**
 * Starts watching the screen frame size. When a non-zero size appears, the size is saved and the watch is stopped.
 * Later, when `getScreenFrame` runs, it will return the saved non-zero size if the current size is null.
 *
 * This trick is required to mitigate the fact that the screen frame turns null in some cases.
 * See more on this at https://github.com/fingerprintjs/fingerprintjs/issues/568
 */
function watchScreenFrame() {
	if ( screenFrameSizeTimeoutId !== undefined ) {
		return;
	}
	var checkScreenFrame = function () {
		var frameSize = getCurrentScreenFrame();
		if ( isFrameSizeNull( frameSize ) ) {
			screenFrameSizeTimeoutId = setTimeout( checkScreenFrame, exports.screenFrameCheckInterval );
		} else {
			screenFrameBackup = frameSize;
			screenFrameSizeTimeoutId = undefined;
		}
	};
	checkScreenFrame();
}
/**
 * For tests only
 */
function resetScreenFrameWatch() {
	if ( screenFrameSizeTimeoutId !== undefined ) {
		clearTimeout( screenFrameSizeTimeoutId );
		screenFrameSizeTimeoutId = undefined;
	}
	screenFrameBackup = undefined;
}
exports.resetScreenFrameWatch = resetScreenFrameWatch;
/**
 * For tests only
 */
function hasScreenFrameBackup() {
	return !! screenFrameBackup;
}
exports.hasScreenFrameBackup = hasScreenFrameBackup;
function getScreenFrame() {
	var _this = this;
	watchScreenFrame();
	return function () {
		return tslib_1.__awaiter( _this, void 0, void 0, function () {
			var frameSize;
			return tslib_1.__generator( this, function ( _a ) {
				switch ( _a.label ) {
					case 0:
						frameSize = getCurrentScreenFrame();
						if ( ! isFrameSizeNull( frameSize ) ) return [ 3 /*break*/, 2 ];
						if ( screenFrameBackup ) {
							return [ 2 /*return*/, tslib_1.__spreadArray( [], screenFrameBackup, true ) ];
						}
						if ( ! ( 0, browser_1.getFullscreenElement )() ) return [ 3 /*break*/, 2 ];
						// Some browsers set the screen frame to zero when programmatic fullscreen is on.
						// There is a chance of getting a non-zero frame after exiting the fullscreen.
						// See more on this at https://github.com/fingerprintjs/fingerprintjs/issues/568
						return [ 4 /*yield*/, ( 0, browser_1.exitFullscreen )() ];
					case 1:
						// Some browsers set the screen frame to zero when programmatic fullscreen is on.
						// There is a chance of getting a non-zero frame after exiting the fullscreen.
						// See more on this at https://github.com/fingerprintjs/fingerprintjs/issues/568
						_a.sent();
						frameSize = getCurrentScreenFrame();
						_a.label = 2;
					case 2:
						if ( ! isFrameSizeNull( frameSize ) ) {
							screenFrameBackup = frameSize;
						}
						return [ 2 /*return*/, frameSize ];
				}
			} );
		} );
	};
}
exports.getScreenFrame = getScreenFrame;
/**
 * Sometimes the available screen resolution changes a bit, e.g. 1900x1440 → 1900x1439. A possible reason: macOS Dock
 * shrinks to fit more icons when there is too little space. The rounding is used to mitigate the difference.
 */
function getRoundedScreenFrame() {
	var _this = this;
	var screenFrameGetter = getScreenFrame();
	return function () {
		return tslib_1.__awaiter( _this, void 0, void 0, function () {
			var frameSize, processSize;
			return tslib_1.__generator( this, function ( _a ) {
				switch ( _a.label ) {
					case 0:
						return [ 4 /*yield*/, screenFrameGetter() ];
					case 1:
						frameSize = _a.sent();
						processSize = function ( sideSize ) {
							return sideSize === null ? null : ( 0, data_1.round )( sideSize, roundingPrecision );
						};
						// It might look like I don't know about `for` and `map`.
						// In fact, such code is used to avoid TypeScript issues without using `as`.
						return [
							2 /*return*/,
							[
								processSize( frameSize[ 0 ] ),
								processSize( frameSize[ 1 ] ),
								processSize( frameSize[ 2 ] ),
								processSize( frameSize[ 3 ] ),
							],
						];
				}
			} );
		} );
	};
}
exports.getRoundedScreenFrame = getRoundedScreenFrame;
function getCurrentScreenFrame() {
	var s = screen;
	// Some browsers return screen resolution as strings, e.g. "1200", instead of a number, e.g. 1200.
	// I suspect it's done by certain plugins that randomize browser properties to prevent fingerprinting.
	//
	// Some browsers (IE, Edge ≤18) don't provide `screen.availLeft` and `screen.availTop`. The property values are
	// replaced with 0 in such cases to not lose the entropy from `screen.availWidth` and `screen.availHeight`.
	return [
		( 0, data_1.replaceNaN )( ( 0, data_1.toFloat )( s.availTop ), null ),
		( 0, data_1.replaceNaN )(
			( 0, data_1.toFloat )( s.width ) -
				( 0, data_1.toFloat )( s.availWidth ) -
				( 0, data_1.replaceNaN )( ( 0, data_1.toFloat )( s.availLeft ), 0 ),
			null
		),
		( 0, data_1.replaceNaN )(
			( 0, data_1.toFloat )( s.height ) -
				( 0, data_1.toFloat )( s.availHeight ) -
				( 0, data_1.replaceNaN )( ( 0, data_1.toFloat )( s.availTop ), 0 ),
			null
		),
		( 0, data_1.replaceNaN )( ( 0, data_1.toFloat )( s.availLeft ), null ),
	];
}
function isFrameSizeNull( frameSize ) {
	for ( var i = 0; i < 4; ++i ) {
		if ( frameSize[ i ] ) {
			return false;
		}
	}
	return true;
}
