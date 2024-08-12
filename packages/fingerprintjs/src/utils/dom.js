'use strict';
Object.defineProperty( exports, '__esModule', { value: true } );
exports.addStyleString = exports.selectorToElement = exports.withIframe = void 0;
var tslib_1 = require( 'tslib' );
var async_1 = require( './async' );
var data_1 = require( './data' );
/**
 * Creates and keeps an invisible iframe while the given function runs.
 * The given function is called when the iframe is loaded and has a body.
 * The iframe allows to measure DOM sizes inside itself.
 *
 * Notice: passing an initial HTML code doesn't work in IE.
 *
 * Warning for package users:
 * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
 */
function withIframe( action, initialHtml, domPollInterval ) {
	var _a, _b, _c;
	if ( domPollInterval === void 0 ) {
		domPollInterval = 50;
	}
	return tslib_1.__awaiter( this, void 0, void 0, function () {
		var d, iframe;
		return tslib_1.__generator( this, function ( _d ) {
			switch ( _d.label ) {
				case 0:
					d = document;
					_d.label = 1;
				case 1:
					if ( !! d.body ) return [ 3 /*break*/, 3 ];
					return [ 4 /*yield*/, ( 0, async_1.wait )( domPollInterval ) ];
				case 2:
					_d.sent();
					return [ 3 /*break*/, 1 ];
				case 3:
					iframe = d.createElement( 'iframe' );
					_d.label = 4;
				case 4:
					_d.trys.push( [ 4, , 10, 11 ] );
					return [
						4 /*yield*/,
						new Promise( function ( _resolve, _reject ) {
							var isComplete = false;
							var resolve = function () {
								isComplete = true;
								_resolve();
							};
							var reject = function ( error ) {
								isComplete = true;
								_reject( error );
							};
							iframe.onload = resolve;
							iframe.onerror = reject;
							var style = iframe.style;
							style.setProperty( 'display', 'block', 'important' ); // Required for browsers to calculate the layout
							style.position = 'absolute';
							style.top = '0';
							style.left = '0';
							style.visibility = 'hidden';
							if ( initialHtml && 'srcdoc' in iframe ) {
								iframe.srcdoc = initialHtml;
							} else {
								iframe.src = 'about:blank';
							}
							d.body.appendChild( iframe );
							// WebKit in WeChat doesn't fire the iframe's `onload` for some reason.
							// This code checks for the loading state manually.
							// See https://github.com/fingerprintjs/fingerprintjs/issues/645
							var checkReadyState = function () {
								var _a, _b;
								// The ready state may never become 'complete' in Firefox despite the 'load' event being fired.
								// So an infinite setTimeout loop can happen without this check.
								// See https://github.com/fingerprintjs/fingerprintjs/pull/716#issuecomment-986898796
								if ( isComplete ) {
									return;
								}
								// Make sure iframe.contentWindow and iframe.contentWindow.document are both loaded
								// The contentWindow.document can miss in JSDOM (https://github.com/jsdom/jsdom).
								if (
									( ( _b =
										( _a = iframe.contentWindow ) === null || _a === void 0
											? void 0
											: _a.document ) === null || _b === void 0
										? void 0
										: _b.readyState ) === 'complete'
								) {
									resolve();
								} else {
									setTimeout( checkReadyState, 10 );
								}
							};
							checkReadyState();
						} ),
					];
				case 5:
					_d.sent();
					_d.label = 6;
				case 6:
					if (
						!! ( ( _b =
							( _a = iframe.contentWindow ) === null || _a === void 0 ? void 0 : _a.document ) ===
							null || _b === void 0
							? void 0
							: _b.body )
					)
						return [ 3 /*break*/, 8 ];
					return [ 4 /*yield*/, ( 0, async_1.wait )( domPollInterval ) ];
				case 7:
					_d.sent();
					return [ 3 /*break*/, 6 ];
				case 8:
					return [ 4 /*yield*/, action( iframe, iframe.contentWindow ) ];
				case 9:
					return [ 2 /*return*/, _d.sent() ];
				case 10:
					( _c = iframe.parentNode ) === null || _c === void 0 ? void 0 : _c.removeChild( iframe );
					return [ 7 /*endfinally*/ ];
				case 11:
					return [ 2 /*return*/ ];
			}
		} );
	} );
}
exports.withIframe = withIframe;
/**
 * Creates a DOM element that matches the given selector.
 * Only single element selector are supported (without operators like space, +, >, etc).
 */
function selectorToElement( selector ) {
	var _a = ( 0, data_1.parseSimpleCssSelector )( selector ),
		tag = _a[ 0 ],
		attributes = _a[ 1 ];
	var element = document.createElement( tag !== null && tag !== void 0 ? tag : 'div' );
	for ( var _i = 0, _b = Object.keys( attributes ); _i < _b.length; _i++ ) {
		var name_1 = _b[ _i ];
		var value = attributes[ name_1 ].join( ' ' );
		// Changing the `style` attribute can cause a CSP error, therefore we change the `style.cssText` property.
		// https://github.com/fingerprintjs/fingerprintjs/issues/733
		if ( name_1 === 'style' ) {
			addStyleString( element.style, value );
		} else {
			element.setAttribute( name_1, value );
		}
	}
	return element;
}
exports.selectorToElement = selectorToElement;
/**
 * Adds CSS styles from a string in such a way that doesn't trigger a CSP warning (unsafe-inline or unsafe-eval)
 */
function addStyleString( style, source ) {
	// We don't use `style.cssText` because browsers must block it when no `unsafe-eval` CSP is presented: https://csplite.com/csp145/#w3c_note
	// Even though the browsers ignore this standard, we don't use `cssText` just in case.
	for ( var _i = 0, _a = source.split( ';' ); _i < _a.length; _i++ ) {
		var property = _a[ _i ];
		var match = /^\s*([\w-]+)\s*:\s*(.+?)(\s*!([\w-]+))?\s*$/.exec( property );
		if ( match ) {
			var name_2 = match[ 1 ],
				value = match[ 2 ],
				priority = match[ 4 ];
			style.setProperty( name_2, value, priority || '' ); // The last argument can't be undefined in IE11
		}
	}
}
exports.addStyleString = addStyleString;
