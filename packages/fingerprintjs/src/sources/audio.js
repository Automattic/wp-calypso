'use strict';
Object.defineProperty( exports, '__esModule', { value: true } );
var async_1 = require( '../utils/async' );
var browser_1 = require( '../utils/browser' );
/**
 * A deep description: https://fingerprint.com/blog/audio-fingerprinting/
 * Inspired by and based on https://github.com/cozylife/audio-fingerprint
 */
function getAudioFingerprint() {
	var w = window;
	var AudioContext = w.OfflineAudioContext || w.webkitOfflineAudioContext;
	if ( ! AudioContext ) {
		return -2 /* SpecialFingerprint.NotSupported */;
	}
	// In some browsers, audio context always stays suspended unless the context is started in response to a user action
	// (e.g. a click or a tap). It prevents audio fingerprint from being taken at an arbitrary moment of time.
	// Such browsers are old and unpopular, so the audio fingerprinting is just skipped in them.
	// See a similar case explanation at https://stackoverflow.com/questions/46363048/onaudioprocess-not-called-on-ios11#46534088
	if ( doesCurrentBrowserSuspendAudioContext() ) {
		return -1 /* SpecialFingerprint.KnownToSuspend */;
	}
	var hashFromIndex = 4500;
	var hashToIndex = 5000;
	var context = new AudioContext( 1, hashToIndex, 44100 );
	var oscillator = context.createOscillator();
	oscillator.type = 'triangle';
	oscillator.frequency.value = 10000;
	var compressor = context.createDynamicsCompressor();
	compressor.threshold.value = -50;
	compressor.knee.value = 40;
	compressor.ratio.value = 12;
	compressor.attack.value = 0;
	compressor.release.value = 0.25;
	oscillator.connect( compressor );
	compressor.connect( context.destination );
	oscillator.start( 0 );
	var _a = startRenderingAudio( context ),
		renderPromise = _a[ 0 ],
		finishRendering = _a[ 1 ];
	var fingerprintPromise = renderPromise.then(
		function ( buffer ) {
			return getHash( buffer.getChannelData( 0 ).subarray( hashFromIndex ) );
		},
		function ( error ) {
			if (
				error.name === 'timeout' /* InnerErrorName.Timeout */ ||
				error.name === 'suspended' /* InnerErrorName.Suspended */
			) {
				return -3 /* SpecialFingerprint.Timeout */;
			}
			throw error;
		}
	);
	// Suppresses the console error message in case when the fingerprint fails before requested
	( 0, async_1.suppressUnhandledRejectionWarning )( fingerprintPromise );
	return function () {
		finishRendering();
		return fingerprintPromise;
	};
}
exports.default = getAudioFingerprint;
/**
 * Checks if the current browser is known to always suspend audio context
 */
function doesCurrentBrowserSuspendAudioContext() {
	return (
		( 0, browser_1.isWebKit )() &&
		! ( 0, browser_1.isDesktopSafari )() &&
		! ( 0, browser_1.isWebKit606OrNewer )()
	);
}
/**
 * Starts rendering the audio context.
 * When the returned function is called, the render process starts finishing.
 */
function startRenderingAudio( context ) {
	var renderTryMaxCount = 3;
	var renderRetryDelay = 500;
	var runningMaxAwaitTime = 500;
	var runningSufficientTime = 5000;
	var finalize = function () {
		return undefined;
	};
	var resultPromise = new Promise( function ( resolve, reject ) {
		var isFinalized = false;
		var renderTryCount = 0;
		var startedRunningAt = 0;
		context.oncomplete = function ( event ) {
			return resolve( event.renderedBuffer );
		};
		var startRunningTimeout = function () {
			setTimeout(
				function () {
					return reject( makeInnerError( 'timeout' /* InnerErrorName.Timeout */ ) );
				},
				Math.min( runningMaxAwaitTime, startedRunningAt + runningSufficientTime - Date.now() )
			);
		};
		var tryRender = function () {
			try {
				var renderingPromise = context.startRendering();
				// `context.startRendering` has two APIs: Promise and callback, we check that it's really a promise just in case
				if ( ( 0, async_1.isPromise )( renderingPromise ) ) {
					// Suppresses all unhadled rejections in case of scheduled redundant retries after successful rendering
					( 0, async_1.suppressUnhandledRejectionWarning )( renderingPromise );
				}
				switch ( context.state ) {
					case 'running':
						startedRunningAt = Date.now();
						if ( isFinalized ) {
							startRunningTimeout();
						}
						break;
					// Sometimes the audio context doesn't start after calling `startRendering` (in addition to the cases where
					// audio context doesn't start at all). A known case is starting an audio context when the browser tab is in
					// background on iPhone. Retries usually help in this case.
					case 'suspended':
						// The audio context can reject starting until the tab is in foreground. Long fingerprint duration
						// in background isn't a problem, therefore the retry attempts don't count in background. It can lead to
						// a situation when a fingerprint takes very long time and finishes successfully. FYI, the audio context
						// can be suspended when `document.hidden === false` and start running after a retry.
						if ( ! document.hidden ) {
							renderTryCount++;
						}
						if ( isFinalized && renderTryCount >= renderTryMaxCount ) {
							reject( makeInnerError( 'suspended' /* InnerErrorName.Suspended */ ) );
						} else {
							setTimeout( tryRender, renderRetryDelay );
						}
						break;
				}
			} catch ( error ) {
				reject( error );
			}
		};
		tryRender();
		finalize = function () {
			if ( ! isFinalized ) {
				isFinalized = true;
				if ( startedRunningAt > 0 ) {
					startRunningTimeout();
				}
			}
		};
	} );
	return [ resultPromise, finalize ];
}
function getHash( signal ) {
	var hash = 0;
	for ( var i = 0; i < signal.length; ++i ) {
		hash += Math.abs( signal[ i ] );
	}
	return hash;
}
function makeInnerError( name ) {
	var error = new Error( name );
	error.name = name;
	return error;
}
