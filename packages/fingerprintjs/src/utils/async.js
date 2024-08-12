'use strict';
Object.defineProperty( exports, '__esModule', { value: true } );
exports.suppressUnhandledRejectionWarning =
	exports.mapWithBreaks =
	exports.awaitIfAsync =
	exports.isPromise =
	exports.requestIdleCallbackIfAvailable =
	exports.wait =
		void 0;
var tslib_1 = require( 'tslib' );
function wait( durationMs, resolveWith ) {
	return new Promise( function ( resolve ) {
		return setTimeout( resolve, durationMs, resolveWith );
	} );
}
exports.wait = wait;
function requestIdleCallbackIfAvailable( fallbackTimeout, deadlineTimeout ) {
	if ( deadlineTimeout === void 0 ) {
		deadlineTimeout = Infinity;
	}
	var requestIdleCallback = window.requestIdleCallback;
	if ( requestIdleCallback ) {
		// The function `requestIdleCallback` loses the binding to `window` here.
		// `globalThis` isn't always equal `window` (see https://github.com/fingerprintjs/fingerprintjs/issues/683).
		// Therefore, an error can occur. `call(window,` prevents the error.
		return new Promise( function ( resolve ) {
			return requestIdleCallback.call(
				window,
				function () {
					return resolve();
				},
				{ timeout: deadlineTimeout }
			);
		} );
	}
	return wait( Math.min( fallbackTimeout, deadlineTimeout ) );
}
exports.requestIdleCallbackIfAvailable = requestIdleCallbackIfAvailable;
function isPromise( value ) {
	return !! value && typeof value.then === 'function';
}
exports.isPromise = isPromise;
/**
 * Calls a maybe asynchronous function without creating microtasks when the function is synchronous.
 * Catches errors in both cases.
 *
 * If just you run a code like this:
 * ```
 * console.time('Action duration')
 * await action()
 * console.timeEnd('Action duration')
 * ```
 * The synchronous function time can be measured incorrectly because another microtask may run before the `await`
 * returns the control back to the code.
 */
function awaitIfAsync( action, callback ) {
	try {
		var returnedValue = action();
		if ( isPromise( returnedValue ) ) {
			returnedValue.then(
				function ( result ) {
					return callback( true, result );
				},
				function ( error ) {
					return callback( false, error );
				}
			);
		} else {
			callback( true, returnedValue );
		}
	} catch ( error ) {
		callback( false, error );
	}
}
exports.awaitIfAsync = awaitIfAsync;
/**
 * If you run many synchronous tasks without using this function, the JS main loop will be busy and asynchronous tasks
 * (e.g. completing a network request, rendering the page) won't be able to happen.
 * This function allows running many synchronous tasks such way that asynchronous tasks can run too in background.
 */
function mapWithBreaks( items, callback, loopReleaseInterval ) {
	if ( loopReleaseInterval === void 0 ) {
		loopReleaseInterval = 16;
	}
	return tslib_1.__awaiter( this, void 0, void 0, function () {
		var results, lastLoopReleaseTime, i, now;
		return tslib_1.__generator( this, function ( _a ) {
			switch ( _a.label ) {
				case 0:
					results = Array( items.length );
					lastLoopReleaseTime = Date.now();
					i = 0;
					_a.label = 1;
				case 1:
					if ( ! ( i < items.length ) ) return [ 3 /*break*/, 4 ];
					results[ i ] = callback( items[ i ], i );
					now = Date.now();
					if ( ! ( now >= lastLoopReleaseTime + loopReleaseInterval ) ) return [ 3 /*break*/, 3 ];
					lastLoopReleaseTime = now;
					// Allows asynchronous actions and microtasks to happen
					return [ 4 /*yield*/, wait( 0 ) ];
				case 2:
					// Allows asynchronous actions and microtasks to happen
					_a.sent();
					_a.label = 3;
				case 3:
					++i;
					return [ 3 /*break*/, 1 ];
				case 4:
					return [ 2 /*return*/, results ];
			}
		} );
	} );
}
exports.mapWithBreaks = mapWithBreaks;
/**
 * Makes the given promise never emit an unhandled promise rejection console warning.
 * The promise will still pass errors to the next promises.
 *
 * Otherwise, promise emits a console warning unless it has a `catch` listener.
 */
function suppressUnhandledRejectionWarning( promise ) {
	promise.then( undefined, function () {
		return undefined;
	} );
}
exports.suppressUnhandledRejectionWarning = suppressUnhandledRejectionWarning;
