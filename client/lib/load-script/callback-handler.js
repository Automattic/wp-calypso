/** @format */
/**
 * External dependencies
 */
import debugFactory from 'debug';
const debug = debugFactory( 'lib/load-script/callback-handler' );

/**
 * Module variables
 */
const callbacksForURLsInProgress = new Map();

export function getCallbackMap() {
	return callbacksForURLsInProgress;
}

export function isLoading( url ) {
	return callbacksForURLsInProgress.has( url );
}

export function addScriptCallback( url, callback ) {
	if ( isLoading( url ) ) {
		debug( `Adding a callback for an existing script from "${ url }"` );
		callbacksForURLsInProgress.get( url ).push( callback );
	} else {
		debug( `Adding a callback for a new script from "${ url }"` );
		callbacksForURLsInProgress.set( url, [ callback ] );
	}
}

export function removeScriptCallback( url, callback ) {
	debug( `Removing a known callback for a script from "${ url }"` );

	if ( ! callbacksForURLsInProgress.has( url ) ) {
		return;
	}

	const index = callbacksForURLsInProgress.get( url ).indexOf( callback );

	if ( -1 === index ) {
		return;
	}

	if ( 1 === callbacksForURLsInProgress.get( url ).length ) {
		callbacksForURLsInProgress.delete( url );
		return;
	}

	callbacksForURLsInProgress.get( url ).splice( index, 1 );
}

export function removeScriptCallbacks( url ) {
	debug( `Removing all callbacks for a script from "${ url }"` );
	callbacksForURLsInProgress.delete( url );
}

export function removeAllScriptCallbacks() {
	debug( 'Removing all callbacks for scripts from all URLs' );

	callbacksForURLsInProgress.clear();
}

export function executeCallbacks( url, callbackArguments = null ) {
	if ( callbacksForURLsInProgress.has( url ) ) {
		const debugMessage = `Executing callbacks for "${ url }"`;
		debug(
			callbackArguments === null
				? debugMessage
				: debugMessage + ` with args "${ callbackArguments }"`
		);

		callbacksForURLsInProgress
			.get( url )
			.filter( cb => typeof cb === 'function' )
			.forEach( cb => cb( callbackArguments ) );
		callbacksForURLsInProgress.delete( url );
	}
}

export function handleRequestSuccess( url ) {
	debug( `Handling successful request for "${ url }"` );
	executeCallbacks( url );
	this.onload = null;
}

export function handleRequestError( url ) {
	debug( `Handling failed request for "${ url }"` );
	executeCallbacks( url, new Error( `Failed to load script "${ url }"` ) );
	this.onerror = null;
}
