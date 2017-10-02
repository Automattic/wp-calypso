/** @format */
/**
 * External dependencies
 */
import { includes } from 'lodash';
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
		callbacksMap.get( url ).push( callback );
	} else {
		debug( `Adding a callback for a new script from "${ url }"` );
		callbacksMap.set( url, [ callback ] );
	}
}

export function removeScriptCallback( url, callback ) {
	debug( `Removing a known callback for a script from "${ url }"` );

	if ( ! isLoading( url ) ) {
		return;
	}

	const callbacksMap = getCallbacksMap();
	const callbacksAtUrl = callbacksMap.get( url );

	if ( ! includes( callbacksAtUrl, callback ) ) {
		return;
	}

	if ( 1 === callbacksAtUrl.length ) {
		callbacksMap.delete( url );
		return;
	}

	const index = callbacksAtUrl.indexOf( callback );
	callbacksAtUrl.splice( index, 1 );
}

export function removeScriptCallbacks( url ) {
	debug( `Removing all callbacks for a script from "${ url }"` );
	getCallbacksMap().delete( url );
}

export function removeAllScriptCallbacks() {
	debug( 'Removing all callbacks for scripts from all URLs' );

	getCallbacksMap().clear();
}

export function executeCallbacks( url, callbackArguments = null ) {
	const callbacksMap = getCallbacksMap();

	if ( callbacksMap.has( url ) ) {
		const debugMessage = `Executing callbacks for "${ url }"`;
		debug(
			callbackArguments === null
				? debugMessage
				: debugMessage + ` with args "${ callbackArguments }"`
		);

		callbacksMap
			.get( url )
			.filter( cb => typeof cb === 'function' )
			.forEach( cb => cb( callbackArguments ) );
		callbacksMap.delete( url );
	}
}

export function handleRequestSuccess( event ) {
	const { target: { src: url } } = event;
	debug( `Handling successful request for "${ url }"` );
	executeCallbacks( url );
	this.onload = null;
}

export function handleRequestError( event ) {
	const { target: { src: url } } = event;
	debug( `Handling failed request for "${ url }"` );
	executeCallbacks( url, new Error( `Failed to load script "${ url }"` ) );
	this.onerror = null;
}
