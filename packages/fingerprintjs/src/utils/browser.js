'use strict';
Object.defineProperty( exports, '__esModule', { value: true } );
exports.isAndroid =
	exports.exitFullscreen =
	exports.getFullscreenElement =
	exports.isIPad =
	exports.isWebKit606OrNewer =
	exports.isChromium86OrNewer =
	exports.isGecko =
	exports.isDesktopSafari =
	exports.isWebKit =
	exports.isChromium =
	exports.isEdgeHTML =
	exports.isTrident =
		void 0;
var data_1 = require( './data' );
/*
 * Functions to help with features that vary through browsers
 */
/**
 * Checks whether the browser is based on Trident (the Internet Explorer engine) without using user-agent.
 *
 * Warning for package users:
 * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
 */
function isTrident() {
	var w = window;
	var n = navigator;
	// The properties are checked to be in IE 10, IE 11 and not to be in other browsers in October 2020
	return (
		( 0, data_1.countTruthy )( [
			'MSCSSMatrix' in w,
			'msSetImmediate' in w,
			'msIndexedDB' in w,
			'msMaxTouchPoints' in n,
			'msPointerEnabled' in n,
		] ) >= 4
	);
}
exports.isTrident = isTrident;
/**
 * Checks whether the browser is based on EdgeHTML (the pre-Chromium Edge engine) without using user-agent.
 *
 * Warning for package users:
 * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
 */
function isEdgeHTML() {
	// Based on research in October 2020
	var w = window;
	var n = navigator;
	return (
		( 0, data_1.countTruthy )( [
			'msWriteProfilerMark' in w,
			'MSStream' in w,
			'msLaunchUri' in n,
			'msSaveBlob' in n,
		] ) >= 3 && ! isTrident()
	);
}
exports.isEdgeHTML = isEdgeHTML;
/**
 * Checks whether the browser is based on Chromium without using user-agent.
 *
 * Warning for package users:
 * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
 */
function isChromium() {
	// Based on research in October 2020. Tested to detect Chromium 42-86.
	var w = window;
	var n = navigator;
	return (
		( 0, data_1.countTruthy )( [
			'webkitPersistentStorage' in n,
			'webkitTemporaryStorage' in n,
			n.vendor.indexOf( 'Google' ) === 0,
			'webkitResolveLocalFileSystemURL' in w,
			'BatteryManager' in w,
			'webkitMediaStream' in w,
			'webkitSpeechGrammar' in w,
		] ) >= 5
	);
}
exports.isChromium = isChromium;
/**
 * Checks whether the browser is based on mobile or desktop Safari without using user-agent.
 * All iOS browsers use WebKit (the Safari engine).
 *
 * Warning for package users:
 * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
 */
function isWebKit() {
	// Based on research in September 2020
	var w = window;
	var n = navigator;
	return (
		( 0, data_1.countTruthy )( [
			'ApplePayError' in w,
			'CSSPrimitiveValue' in w,
			'Counter' in w,
			n.vendor.indexOf( 'Apple' ) === 0,
			'getStorageUpdates' in n,
			'WebKitMediaKeys' in w,
		] ) >= 4
	);
}
exports.isWebKit = isWebKit;
/**
 * Checks whether the WebKit browser is a desktop Safari.
 *
 * Warning for package users:
 * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
 */
function isDesktopSafari() {
	var w = window;
	return (
		( 0, data_1.countTruthy )( [
			'safari' in w,
			! ( 'DeviceMotionEvent' in w ),
			! ( 'ongestureend' in w ),
			! ( 'standalone' in navigator ),
		] ) >= 3
	);
}
exports.isDesktopSafari = isDesktopSafari;
/**
 * Checks whether the browser is based on Gecko (Firefox engine) without using user-agent.
 *
 * Warning for package users:
 * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
 */
function isGecko() {
	var _a, _b;
	var w = window;
	// Based on research in September 2020
	return (
		( 0, data_1.countTruthy )( [
			'buildID' in navigator,
			'MozAppearance' in
				( ( _b =
					( _a = document.documentElement ) === null || _a === void 0 ? void 0 : _a.style ) !==
					null && _b !== void 0
					? _b
					: {} ),
			'onmozfullscreenchange' in w,
			'mozInnerScreenX' in w,
			'CSSMozDocumentRule' in w,
			'CanvasCaptureMediaStream' in w,
		] ) >= 4
	);
}
exports.isGecko = isGecko;
/**
 * Checks whether the browser is based on Chromium version ≥86 without using user-agent.
 * It doesn't check that the browser is based on Chromium, there is a separate function for this.
 */
function isChromium86OrNewer() {
	// Checked in Chrome 85 vs Chrome 86 both on desktop and Android
	var w = window;
	return (
		( 0, data_1.countTruthy )( [
			! ( 'MediaSettingsRange' in w ),
			'RTCEncodedAudioFrame' in w,
			'' + w.Intl === '[object Intl]',
			'' + w.Reflect === '[object Reflect]',
		] ) >= 3
	);
}
exports.isChromium86OrNewer = isChromium86OrNewer;
/**
 * Checks whether the browser is based on WebKit version ≥606 (Safari ≥12) without using user-agent.
 * It doesn't check that the browser is based on WebKit, there is a separate function for this.
 *
 * link: https://en.wikipedia.org/wiki/Safari_version_history#Release_history Safari-WebKit versions map
 */
function isWebKit606OrNewer() {
	// Checked in Safari 9–14
	var w = window;
	return (
		( 0, data_1.countTruthy )( [
			'DOMRectList' in w,
			'RTCPeerConnectionIceEvent' in w,
			'SVGGeometryElement' in w,
			'ontransitioncancel' in w,
		] ) >= 3
	);
}
exports.isWebKit606OrNewer = isWebKit606OrNewer;
/**
 * Checks whether the device is an iPad.
 * It doesn't check that the engine is WebKit and that the WebKit isn't desktop.
 */
function isIPad() {
	// Checked on:
	// Safari on iPadOS (both mobile and desktop modes): 8, 11, 12, 13, 14
	// Chrome on iPadOS (both mobile and desktop modes): 11, 12, 13, 14
	// Safari on iOS (both mobile and desktop modes): 9, 10, 11, 12, 13, 14
	// Chrome on iOS (both mobile and desktop modes): 9, 10, 11, 12, 13, 14
	// Before iOS 13. Safari tampers the value in "request desktop site" mode since iOS 13.
	if ( navigator.platform === 'iPad' ) {
		return true;
	}
	var s = screen;
	var screenRatio = s.width / s.height;
	return (
		( 0, data_1.countTruthy )( [
			'MediaSource' in window,
			!! Element.prototype.webkitRequestFullscreen,
			// iPhone 4S that runs iOS 9 matches this. But it won't match the criteria above, so it won't be detected as iPad.
			screenRatio > 0.65 && screenRatio < 1.53,
		] ) >= 2
	);
}
exports.isIPad = isIPad;
/**
 * Warning for package users:
 * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
 */
function getFullscreenElement() {
	var d = document;
	return (
		d.fullscreenElement ||
		d.msFullscreenElement ||
		d.mozFullScreenElement ||
		d.webkitFullscreenElement ||
		null
	);
}
exports.getFullscreenElement = getFullscreenElement;
function exitFullscreen() {
	var d = document;
	// `call` is required because the function throws an error without a proper "this" context
	return (
		d.exitFullscreen ||
		d.msExitFullscreen ||
		d.mozCancelFullScreen ||
		d.webkitExitFullscreen
	).call( d );
}
exports.exitFullscreen = exitFullscreen;
/**
 * Checks whether the device runs on Android without using user-agent.
 *
 * Warning for package users:
 * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
 */
function isAndroid() {
	var isItChromium = isChromium();
	var isItGecko = isGecko();
	// Only 2 browser engines are presented on Android.
	// Actually, there is also Android 4.1 browser, but it's not worth detecting it at the moment.
	if ( ! isItChromium && ! isItGecko ) {
		return false;
	}
	var w = window;
	// Chrome removes all words "Android" from `navigator` when desktop version is requested
	// Firefox keeps "Android" in `navigator.appVersion` when desktop version is requested
	return (
		( 0, data_1.countTruthy )( [
			'onorientationchange' in w,
			'orientation' in w,
			isItChromium && ! ( 'SharedWorker' in w ),
			isItGecko && /android/i.test( navigator.appVersion ),
		] ) >= 2
	);
}
exports.isAndroid = isAndroid;
