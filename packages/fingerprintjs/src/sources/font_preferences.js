'use strict';
Object.defineProperty( exports, '__esModule', { value: true } );
exports.presets = void 0;
var tslib_1 = require( 'tslib' );
var browser_1 = require( '../utils/browser' );
var dom_1 = require( '../utils/dom' );
/**
 * We use m or w because these two characters take up the maximum width.
 * Also there are a couple of ligatures.
 */
var defaultText = 'mmMwWLliI0fiflO&1';
/**
 * Settings of text blocks to measure. The keys are random but persistent words.
 */
exports.presets = {
	/**
	 * The default font. User can change it in desktop Chrome, desktop Firefox, IE 11,
	 * Android Chrome (but only when the size is ≥ than the default) and Android Firefox.
	 */
	default: [],
	/** OS font on macOS. User can change its size and weight. Applies after Safari restart. */
	apple: [ { font: '-apple-system-body' } ],
	/** User can change it in desktop Chrome and desktop Firefox. */
	serif: [ { fontFamily: 'serif' } ],
	/** User can change it in desktop Chrome and desktop Firefox. */
	sans: [ { fontFamily: 'sans-serif' } ],
	/** User can change it in desktop Chrome and desktop Firefox. */
	mono: [ { fontFamily: 'monospace' } ],
	/**
	 * Check the smallest allowed font size. User can change it in desktop Chrome, desktop Firefox and desktop Safari.
	 * The height can be 0 in Chrome on a retina display.
	 */
	min: [ { fontSize: '1px' } ],
	/** Tells one OS from another in desktop Chrome. */
	system: [ { fontFamily: 'system-ui' } ],
};
/**
 * The result is a dictionary of the width of the text samples.
 * Heights aren't included because they give no extra entropy and are unstable.
 *
 * The result is very stable in IE 11, Edge 18 and Safari 14.
 * The result changes when the OS pixel density changes in Chromium 87. The real pixel density is required to solve,
 * but seems like it's impossible: https://stackoverflow.com/q/1713771/1118709.
 * The "min" and the "mono" (only on Windows) value may change when the page is zoomed in Firefox 87.
 */
function getFontPreferences() {
	return withNaturalFonts( function ( document, container ) {
		var elements = {};
		var sizes = {};
		// First create all elements to measure. If the DOM steps below are done in a single cycle,
		// browser will alternate tree modification and layout reading, that is very slow.
		for ( var _i = 0, _a = Object.keys( exports.presets ); _i < _a.length; _i++ ) {
			var key = _a[ _i ];
			var _b = exports.presets[ key ],
				_c = _b[ 0 ],
				style = _c === void 0 ? {} : _c,
				_d = _b[ 1 ],
				text = _d === void 0 ? defaultText : _d;
			var element = document.createElement( 'span' );
			element.textContent = text;
			element.style.whiteSpace = 'nowrap';
			for ( var _e = 0, _f = Object.keys( style ); _e < _f.length; _e++ ) {
				var name_1 = _f[ _e ];
				var value = style[ name_1 ];
				if ( value !== undefined ) {
					element.style[ name_1 ] = value;
				}
			}
			elements[ key ] = element;
			container.appendChild( document.createElement( 'br' ) );
			container.appendChild( element );
		}
		// Then measure the created elements
		for ( var _g = 0, _h = Object.keys( exports.presets ); _g < _h.length; _g++ ) {
			var key = _h[ _g ];
			sizes[ key ] = elements[ key ].getBoundingClientRect().width;
		}
		return sizes;
	} );
}
exports.default = getFontPreferences;
/**
 * Creates a DOM environment that provides the most natural font available, including Android OS font.
 * Measurements of the elements are zoom-independent.
 * Don't put a content to measure inside an absolutely positioned element.
 */
function withNaturalFonts( action, containerWidthPx ) {
	if ( containerWidthPx === void 0 ) {
		containerWidthPx = 4000;
	}
	/*
	 * Requirements for Android Chrome to apply the system font size to a text inside an iframe:
	 * - The iframe mustn't have a `display: none;` style;
	 * - The text mustn't be positioned absolutely;
	 * - The text block must be wide enough.
	 *   2560px on some devices in portrait orientation for the biggest font size option (32px);
	 * - There must be much enough text to form a few lines (I don't know the exact numbers);
	 * - The text must have the `text-size-adjust: none` style. Otherwise the text will scale in "Desktop site" mode;
	 *
	 * Requirements for Android Firefox to apply the system font size to a text inside an iframe:
	 * - The iframe document must have a header: `<meta name="viewport" content="width=device-width, initial-scale=1" />`.
	 *   The only way to set it is to use the `srcdoc` attribute of the iframe;
	 * - The iframe content must get loaded before adding extra content with JavaScript;
	 *
	 * https://example.com as the iframe target always inherits Android font settings so it can be used as a reference.
	 *
	 * Observations on how page zoom affects the measurements:
	 * - macOS Safari 11.1, 12.1, 13.1, 14.0: zoom reset + offsetWidth = 100% reliable;
	 * - macOS Safari 11.1, 12.1, 13.1, 14.0: zoom reset + getBoundingClientRect = 100% reliable;
	 * - macOS Safari 14.0: offsetWidth = 5% fluctuation;
	 * - macOS Safari 14.0: getBoundingClientRect = 5% fluctuation;
	 * - iOS Safari 9, 10, 11.0, 12.0: haven't found a way to zoom a page (pinch doesn't change layout);
	 * - iOS Safari 13.1, 14.0: zoom reset + offsetWidth = 100% reliable;
	 * - iOS Safari 13.1, 14.0: zoom reset + getBoundingClientRect = 100% reliable;
	 * - iOS Safari 14.0: offsetWidth = 100% reliable;
	 * - iOS Safari 14.0: getBoundingClientRect = 100% reliable;
	 * - Chrome 42, 65, 80, 87: zoom 1/devicePixelRatio + offsetWidth = 1px fluctuation;
	 * - Chrome 42, 65, 80, 87: zoom 1/devicePixelRatio + getBoundingClientRect = 100% reliable;
	 * - Chrome 87: offsetWidth = 1px fluctuation;
	 * - Chrome 87: getBoundingClientRect = 0.7px fluctuation;
	 * - Firefox 48, 51: offsetWidth = 10% fluctuation;
	 * - Firefox 48, 51: getBoundingClientRect = 10% fluctuation;
	 * - Firefox 52, 53, 57, 62, 66, 67, 68, 71, 75, 80, 84: offsetWidth = width 100% reliable, height 10% fluctuation;
	 * - Firefox 52, 53, 57, 62, 66, 67, 68, 71, 75, 80, 84: getBoundingClientRect = width 100% reliable, height 10%
	 *   fluctuation;
	 * - Android Chrome 86: haven't found a way to zoom a page (pinch doesn't change layout);
	 * - Android Firefox 84: font size in accessibility settings changes all the CSS sizes, but offsetWidth and
	 *   getBoundingClientRect keep measuring with regular units, so the size reflects the font size setting and doesn't
	 *   fluctuate;
	 * - IE 11, Edge 18: zoom 1/devicePixelRatio + offsetWidth = 100% reliable;
	 * - IE 11, Edge 18: zoom 1/devicePixelRatio + getBoundingClientRect = reflects the zoom level;
	 * - IE 11, Edge 18: offsetWidth = 100% reliable;
	 * - IE 11, Edge 18: getBoundingClientRect = 100% reliable;
	 */
	return ( 0, dom_1.withIframe )( function ( _, iframeWindow ) {
		var iframeDocument = iframeWindow.document;
		var iframeBody = iframeDocument.body;
		var bodyStyle = iframeBody.style;
		bodyStyle.width = ''.concat( containerWidthPx, 'px' );
		bodyStyle.webkitTextSizeAdjust = bodyStyle.textSizeAdjust = 'none';
		// See the big comment above
		if ( ( 0, browser_1.isChromium )() ) {
			iframeBody.style.zoom = ''.concat( 1 / iframeWindow.devicePixelRatio );
		} else if ( ( 0, browser_1.isWebKit )() ) {
			iframeBody.style.zoom = 'reset';
		}
		// See the big comment above
		var linesOfText = iframeDocument.createElement( 'div' );
		linesOfText.textContent = tslib_1
			.__spreadArray( [], Array( ( containerWidthPx / 20 ) << 0 ), true )
			.map( function () {
				return 'word';
			} )
			.join( ' ' );
		iframeBody.appendChild( linesOfText );
		return action( iframeDocument, iframeBody );
	}, '<!doctype html><html><head><meta name="viewport" content="width=device-width, initial-scale=1">' );
}
