/**
 * A little module for loading a external script
 *
 * @format
 */

/**
 * External dependencies
 */
import debugFactory from 'debug';
const debug = debugFactory( 'lib/load-script' );

/**
 * Internal dependencies
 */
import config from 'config';

/**
 * Module variables
 */
const callbacksForURLsInProgress = {};

export const JQUERY_URL = 'https://s0.wp.com/wp-includes/js/jquery/jquery.js';

//
// Helper functions
//
export function isLoading( url ) {
	return callbacksForURLsInProgress.hasOwnProperty( url );
}

export function removeScriptCallback( url, callback ) {
	debug( `Removing a known callback for a script from "${ url }"` );

	if ( ! callbacksForURLsInProgress.hasOwnProperty( url ) ) {
		return;
	}

	const index = callbacksForURLsInProgress[ url ].indexOf( callback );

	if ( -1 === index ) {
		return;
	}

	if ( 1 === callbacksForURLsInProgress[ url ].length ) {
		delete callbacksForURLsInProgress[ url ];
		return;
	}

	callbacksForURLsInProgress[ url ].splice( index, 1 );
}

export function removeScriptCallbacks( url ) {
	debug( `Removing all callbacks for a script from "${ url }"` );

	delete callbacksForURLsInProgress[ url ];
}

export function removeAllScriptCallbacks() {
	debug( 'Removing all callbacks for scripts from all URLs' );

	Object.keys( callbacksForURLsInProgress ).map( key => {
		delete callbacksForURLsInProgress[ key ];
	} );
}

//
// loadScript and loadjQueryDependentScript
//

// NOTE: __attachToHead and __createScriptElement are used for testing only.
export function loadScript(
	url,
	callback,
	__attachToHead = _attachToHead,
	__createScriptElement = _createScriptElement
) {
	// If this script is not currently being loaded, create a script element and attach to document head.
	const shouldLoadScript = ! isLoading( url );

	_addScriptCallback( url, callback );

	if ( shouldLoadScript ) {
		__attachToHead( __createScriptElement( url ) );
	}
}

// NOTE: __config and __loadScript are used for testing only.
export function loadjQueryDependentScript(
	url,
	callback,
	__config = config,
	__loadScript = loadScript,
) {
	debug( `Loading a jQuery dependent script from "${ url }"` );

	// It is not possible to expose jQuery globally in Electron App: https://github.com/atom/electron/issues/254.
	// It needs to be loaded using require and npm package.
	if ( __config.isEnabled( 'desktop' ) ) {
		debug( `Attaching jQuery from node_modules to window for "${ url }"` );
		window.$ = window.jQuery = require( 'jquery' );
	}

	if ( window.jQuery ) {
		debug( `jQuery found on window, skipping jQuery script loading for "${ url }"` );
		__loadScript( url, callback );
		return;
	}

	__loadScript( JQUERY_URL, function( error ) {
		if ( error ) {
			callback( error );
		}
		__loadScript( url, callback );
	} );
}

//
// Internal functions
//

export function exposeInternalMethodsForTesting() {
	return {
		_getCallbacks,
		_addScriptCallback,
		_executeCallbacks,
		_createScriptElement,
		_attachToHead,
		_handleRequestSuccess,
		_handleRequestError,
	};
}

function _getCallbacks() {
	return callbacksForURLsInProgress;
}

function _addScriptCallback( url, callback ) {
	if ( isLoading( url ) ) {
		debug( `Adding a callback for an existing script from "${ url }"` );
		callbacksForURLsInProgress[ url ].push( callback );
	} else {
		debug( `Adding a callback for a new script from "${ url }"` );
		callbacksForURLsInProgress[ url ] = [ callback ];
	}
}

function _executeCallbacks( url, callbackArguments = null ) {
	if ( callbacksForURLsInProgress.hasOwnProperty( url ) ) {
		const debugMessage = `Executing callbacks for "${ url }"`;
		debug( callbackArguments === null ? debugMessage : debugMessage + ` with args "${ callbackArguments }"` );

		callbacksForURLsInProgress[ url ].filter( cb => typeof cb === 'function' ).forEach( function( cb ) {
			cb( callbackArguments );
		} );
		delete callbacksForURLsInProgress[ url ];
	}
}

function _createScriptElement( url, onload = _handleRequestSuccess, onerror = _handleRequestError ) {
	debug( `Creating script element for "${ url }"` );
	const script = document.createElement( 'script' );
	script.src = url;
	script.type = 'text/javascript';
	script.async = true;
	script.onload = () => {
		onload.bind( script )( url );
	};
	script.onerror = () => {
		onerror.bind( script )( url );
	};
	return script;
}

function _attachToHead( element ) {
	debug( 'Attaching element to head' );
	document.getElementsByTagName( 'head' )[ 0 ].appendChild( element );
}

// NOTE: __executeCallbacks are used for testing only.
function _handleRequestSuccess( url, __executeCallbacks = _executeCallbacks ) {
	debug( `Handling successful request for "${ url }"` );
	__executeCallbacks( url );
	this.onload = null;
}

// NOTE: __executeCallbacks are used for testing only.
function _handleRequestError( url, __executeCallbacks = _executeCallbacks ) {
	debug( `Handling failed request for "${ url }"` );
	__executeCallbacks( url, new Error( `Failed to load script "${ url }"` ) );
	this.onerror = null;
}
