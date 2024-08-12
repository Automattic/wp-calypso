'use strict';
Object.defineProperty( exports, '__esModule', { value: true } );
exports.transformSource = exports.loadSources = exports.loadSource = void 0;
var tslib_1 = require( 'tslib' );
/* eslint-disable @typescript-eslint/no-explicit-any */
var async_1 = require( './async' );
var data_1 = require( './data' );
function ensureErrorWithMessage( error ) {
	return error && typeof error === 'object' && 'message' in error ? error : { message: error };
}
function isFinalResultLoaded( loadResult ) {
	return typeof loadResult !== 'function';
}
/**
 * Loads the given entropy source. Returns a function that gets an entropy component from the source.
 *
 * The result is returned synchronously to prevent `loadSources` from
 * waiting for one source to load before getting the components from the other sources.
 */
function loadSource( source, sourceOptions ) {
	var sourceLoadPromise = new Promise( function ( resolveLoad ) {
		var loadStartTime = Date.now();
		// `awaitIfAsync` is used instead of just `await` in order to measure the duration of synchronous sources
		// correctly (other microtasks won't affect the duration).
		( 0, async_1.awaitIfAsync )( source.bind( null, sourceOptions ), function () {
			var loadArgs = [];
			for ( var _i = 0; _i < arguments.length; _i++ ) {
				loadArgs[ _i ] = arguments[ _i ];
			}
			var loadDuration = Date.now() - loadStartTime;
			// Source loading failed
			if ( ! loadArgs[ 0 ] ) {
				return resolveLoad( function () {
					return {
						error: ensureErrorWithMessage( loadArgs[ 1 ] ),
						duration: loadDuration,
					};
				} );
			}
			var loadResult = loadArgs[ 1 ];
			// Source loaded with the final result
			if ( isFinalResultLoaded( loadResult ) ) {
				return resolveLoad( function () {
					return { value: loadResult, duration: loadDuration };
				} );
			}
			// Source loaded with "get" stage
			resolveLoad( function () {
				return new Promise( function ( resolveGet ) {
					var getStartTime = Date.now();
					( 0, async_1.awaitIfAsync )( loadResult, function () {
						var getArgs = [];
						for ( var _i = 0; _i < arguments.length; _i++ ) {
							getArgs[ _i ] = arguments[ _i ];
						}
						var duration = loadDuration + Date.now() - getStartTime;
						// Source getting failed
						if ( ! getArgs[ 0 ] ) {
							return resolveGet( {
								error: ensureErrorWithMessage( getArgs[ 1 ] ),
								duration: duration,
							} );
						}
						// Source getting succeeded
						resolveGet( { value: getArgs[ 1 ], duration: duration } );
					} );
				} );
			} );
		} );
	} );
	( 0, async_1.suppressUnhandledRejectionWarning )( sourceLoadPromise );
	return function getComponent() {
		return sourceLoadPromise.then( function ( finalizeSource ) {
			return finalizeSource();
		} );
	};
}
exports.loadSource = loadSource;
/**
 * Loads the given entropy sources. Returns a function that collects the entropy components.
 *
 * The result is returned synchronously in order to allow start getting the components
 * before the sources are loaded completely.
 *
 * Warning for package users:
 * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
 */
function loadSources( sources, sourceOptions, excludeSources ) {
	var includedSources = Object.keys( sources ).filter( function ( sourceKey ) {
		return ( 0, data_1.excludes )( excludeSources, sourceKey );
	} );
	// Using `mapWithBreaks` allows asynchronous sources to complete between synchronous sources
	// and measure the duration correctly
	var sourceGettersPromise = ( 0, async_1.mapWithBreaks )( includedSources, function ( sourceKey ) {
		return loadSource( sources[ sourceKey ], sourceOptions );
	} );
	( 0, async_1.suppressUnhandledRejectionWarning )( sourceGettersPromise );
	return function getComponents() {
		return tslib_1.__awaiter( this, void 0, void 0, function () {
			var sourceGetters, componentPromises, componentArray, components, index;
			return tslib_1.__generator( this, function ( _a ) {
				switch ( _a.label ) {
					case 0:
						return [ 4 /*yield*/, sourceGettersPromise ];
					case 1:
						sourceGetters = _a.sent();
						return [
							4 /*yield*/,
							( 0, async_1.mapWithBreaks )( sourceGetters, function ( sourceGetter ) {
								var componentPromise = sourceGetter();
								( 0, async_1.suppressUnhandledRejectionWarning )( componentPromise );
								return componentPromise;
							} ),
						];
					case 2:
						componentPromises = _a.sent();
						return [ 4 /*yield*/, Promise.all( componentPromises ) ];
					case 3:
						componentArray = _a.sent();
						components = {};
						for ( index = 0; index < includedSources.length; ++index ) {
							components[ includedSources[ index ] ] = componentArray[ index ];
						}
						return [ 2 /*return*/, components ];
				}
			} );
		} );
	};
}
exports.loadSources = loadSources;
/**
 * Modifies an entropy source by transforming its returned value with the given function.
 * Keeps the source properties: sync/async, 1/2 stages.
 *
 * Warning for package users:
 * This function is out of Semantic Versioning, i.e. can change unexpectedly. Usage is at your own risk.
 */
function transformSource( source, transformValue ) {
	var transformLoadResult = function ( loadResult ) {
		if ( isFinalResultLoaded( loadResult ) ) {
			return transformValue( loadResult );
		}
		return function () {
			var getResult = loadResult();
			if ( ( 0, async_1.isPromise )( getResult ) ) {
				return getResult.then( transformValue );
			}
			return transformValue( getResult );
		};
	};
	return function ( options ) {
		var loadResult = source( options );
		if ( ( 0, async_1.isPromise )( loadResult ) ) {
			return loadResult.then( transformLoadResult );
		}
		return transformLoadResult( loadResult );
	};
}
exports.transformSource = transformSource;
