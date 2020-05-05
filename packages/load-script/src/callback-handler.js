/**
 * External dependencies
 */
import debugFactory from 'debug';
const debug = debugFactory( 'lib/load-script/callback-handler' );

/**
 * Module variables
 */
const callbacksForURLsInProgress = new Map();

export function getCallbacksMap() {
	return callbacksForURLsInProgress;
}

export function isLoading( url ) {
	return getCallbacksMap().has( url );
}

export function addScriptCallback( url, callback ) {
	const callbacksMap = getCallbacksMap();
	if ( isLoading( url ) ) {
		debug( `Adding a callback for an existing script from "${ url }"` );
		callbacksMap.get( url ).add( callback );
	} else {
		debug( `Adding a callback for a new script from "${ url }"` );
		callbacksMap.set( url, new Set( [ callback ] ) );
	}
}

export function removeScriptCallback( url, callback ) {
	debug( `Removing a known callback for a script from "${ url }"` );

	if ( ! isLoading( url ) ) {
		return;
	}

	const callbacksMap = getCallbacksMap();
	const callbacksAtUrl = callbacksMap.get( url );
	callbacksAtUrl.delete( callback );

	if ( callbacksAtUrl.size === 0 ) {
		callbacksMap.delete( url );
	}
}

export function removeScriptCallbacks( url ) {
	debug( `Removing all callbacks for a script from "${ url }"` );
	getCallbacksMap().delete( url );
}

export function removeAllScriptCallbacks() {
	debug( 'Removing all callbacks for scripts from all URLs' );
	getCallbacksMap().clear();
}

export function executeCallbacks( url, error = null ) {
	const callbacksMap = getCallbacksMap();
	const callbacksForUrl = callbacksMap.get( url );

	if ( callbacksForUrl ) {
		const debugMessage =
			`Executing callbacks for "${ url }"` +
			( error === null ? ' with success' : ` with error "${ error }"` );
		debug( debugMessage );

		callbacksForUrl.forEach( ( cb ) => {
			if ( typeof cb === 'function' ) {
				cb( error );
			}
		} );

		callbacksMap.delete( url );
	}
}

export function handleRequestSuccess() {
	const url = this.getAttribute( 'src' );
	debug( `Handling successful request for "${ url }"` );
	executeCallbacks( url );
	this.onload = null;
}

export function handleRequestError() {
	const url = this.getAttribute( 'src' );
	debug( `Handling failed request for "${ url }"` );
	executeCallbacks( url, new Error( `Failed to load script "${ url }"` ) );
	this.onerror = null;
}
