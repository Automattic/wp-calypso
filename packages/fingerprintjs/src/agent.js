'use strict';
Object.defineProperty( exports, '__esModule', { value: true } );
exports.load =
	exports.prepareForSources =
	exports.hashComponents =
	exports.componentsToDebugString =
		void 0;
var tslib_1 = require( 'tslib' );
var package_json_1 = require( '../package.json' );
var confidence_1 = tslib_1.__importDefault( require( './confidence' ) );
var sources_1 = tslib_1.__importDefault( require( './sources' ) );
var async_1 = require( './utils/async' );
var hashing_1 = require( './utils/hashing' );
var misc_1 = require( './utils/misc' );
function componentsToCanonicalString( components ) {
	var result = '';
	for ( var _i = 0, _a = Object.keys( components ).sort(); _i < _a.length; _i++ ) {
		var componentKey = _a[ _i ];
		var component = components[ componentKey ];
		var value = component.error ? 'error' : JSON.stringify( component.value );
		result += ''
			.concat( result ? '|' : '' )
			.concat( componentKey.replace( /([:|\\])/g, '\\$1' ), ':' )
			.concat( value );
	}
	return result;
}
function componentsToDebugString( components ) {
	return JSON.stringify(
		components,
		function ( _key, value ) {
			if ( value instanceof Error ) {
				return ( 0, misc_1.errorToObject )( value );
			}
			return value;
		},
		2
	);
}
exports.componentsToDebugString = componentsToDebugString;
function hashComponents( components ) {
	return ( 0, hashing_1.x64hash128 )( componentsToCanonicalString( components ) );
}
exports.hashComponents = hashComponents;
/**
 * Makes a GetResult implementation that calculates the visitor id hash on demand.
 * Designed for optimisation.
 */
function makeLazyGetResult( components ) {
	var visitorIdCache;
	// This function runs very fast, so there is no need to make it lazy
	var confidence = ( 0, confidence_1.default )( components );
	// A plain class isn't used because its getters and setters aren't enumerable.
	return {
		get visitorId() {
			if ( visitorIdCache === undefined ) {
				visitorIdCache = hashComponents( this.components );
			}
			return visitorIdCache;
		},
		set visitorId( visitorId ) {
			visitorIdCache = visitorId;
		},
		confidence: confidence,
		components: components,
		version: package_json_1.version,
	};
}
/**
 * A delay is required to ensure consistent entropy components.
 * See https://github.com/fingerprintjs/fingerprintjs/issues/254
 * and https://github.com/fingerprintjs/fingerprintjs/issues/307
 * and https://github.com/fingerprintjs/fingerprintjs/commit/945633e7c5f67ae38eb0fea37349712f0e669b18
 */
function prepareForSources( delayFallback ) {
	if ( delayFallback === void 0 ) {
		delayFallback = 50;
	}
	// A proper deadline is unknown. Let it be twice the fallback timeout so that both cases have the same average time.
	return ( 0, async_1.requestIdleCallbackIfAvailable )( delayFallback, delayFallback * 2 );
}
exports.prepareForSources = prepareForSources;
/**
 * The function isn't exported from the index file to not allow to call it without `load()`.
 * The hiding gives more freedom for future non-breaking updates.
 *
 * A factory function is used instead of a class to shorten the attribute names in the minified code.
 * Native private class fields could've been used, but TypeScript doesn't allow them with `"target": "es5"`.
 */
function makeAgent( getComponents, debug ) {
	var creationTime = Date.now();
	return {
		get: function ( options ) {
			return tslib_1.__awaiter( this, void 0, void 0, function () {
				var startTime, components, result;
				return tslib_1.__generator( this, function ( _a ) {
					switch ( _a.label ) {
						case 0:
							startTime = Date.now();
							return [ 4 /*yield*/, getComponents() ];
						case 1:
							components = _a.sent();
							result = makeLazyGetResult( components );
							if ( debug || ( options === null || options === void 0 ? void 0 : options.debug ) ) {
								// console.log is ok here because it's under a debug clause
								// eslint-disable-next-line no-console
								console.log(
									'Copy the text below to get the debug data:\n\n```\nversion: '
										.concat( result.version, '\nuserAgent: ' )
										.concat( navigator.userAgent, '\ntimeBetweenLoadAndGet: ' )
										.concat( startTime - creationTime, '\nvisitorId: ' )
										.concat( result.visitorId, '\ncomponents: ' )
										.concat( componentsToDebugString( components ), '\n```' )
								);
							}
							return [ 2 /*return*/, result ];
					}
				} );
			} );
		},
	};
}
/**
 * Sends an unpersonalized AJAX request to collect installation statistics
 */
function monitor() {
	// The FingerprintJS CDN (https://github.com/fingerprintjs/cdn) replaces `window.__fpjs_d_m` with `true`
	if ( window.__fpjs_d_m || Math.random() >= 0.001 ) {
		return;
	}
	try {
		var request = new XMLHttpRequest();
		request.open(
			'get',
			'https://m1.openfpcdn.io/fingerprintjs/v'.concat( package_json_1.version, '/npm-monitoring' ),
			true
		);
		request.send();
	} catch ( error ) {
		// console.error is ok here because it's an unexpected error handler
		// eslint-disable-next-line no-console
		console.error( error );
	}
}
/**
 * Builds an instance of Agent and waits a delay required for a proper operation.
 */
function load( _a ) {
	var _b = _a === void 0 ? {} : _a,
		delayFallback = _b.delayFallback,
		debug = _b.debug,
		_c = _b.monitoring,
		monitoring = _c === void 0 ? true : _c;
	return tslib_1.__awaiter( this, void 0, void 0, function () {
		var getComponents;
		return tslib_1.__generator( this, function ( _d ) {
			switch ( _d.label ) {
				case 0:
					if ( monitoring ) {
						monitor();
					}
					return [ 4 /*yield*/, prepareForSources( delayFallback ) ];
				case 1:
					_d.sent();
					getComponents = ( 0, sources_1.default )( { debug: debug } );
					return [ 2 /*return*/, makeAgent( getComponents, debug ) ];
			}
		} );
	} );
}
exports.load = load;
