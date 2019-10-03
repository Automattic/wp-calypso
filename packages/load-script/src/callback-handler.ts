/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { ScriptCallback } from './types';

const debug = debugFactory( 'load-script:callback-handler' );
const callbacksForURLsInProgress = new Map< string, Set< ScriptCallback > >();

export function getCallbacksMap() {
	return callbacksForURLsInProgress;
}

export function isLoading( url: string ) {
	return getCallbacksMap().has( url );
}

export function addScriptCallback( url: string, callback: ScriptCallback ) {
	const callbacksMap = getCallbacksMap();
	if ( isLoading( url ) ) {
		debug( `Adding a callback for an existing script from "${ url }"` );
		// isLoading implies that we have a Set for the given url.
		( callbacksMap.get( url ) as Set< ScriptCallback > ).add( callback );
	} else {
		debug( `Adding a callback for a new script from "${ url }"` );
		callbacksMap.set( url, new Set( [ callback ] ) );
	}
}

export function removeScriptCallback( url: string, callback: ScriptCallback ) {
	debug( `Removing a known callback for a script from "${ url }"` );

	if ( ! isLoading( url ) ) {
		return;
	}

	const callbacksMap = getCallbacksMap();
	// isLoading implies that we have a Set for the given url.
	const callbacksAtUrl = callbacksMap.get( url ) as Set< ScriptCallback >;
	callbacksAtUrl.delete( callback );

	if ( callbacksAtUrl.size === 0 ) {
		callbacksMap.delete( url );
	}
}

export function removeScriptCallbacks( url: string ) {
	debug( `Removing all callbacks for a script from "${ url }"` );
	getCallbacksMap().delete( url );
}

export function removeAllScriptCallbacks() {
	debug( 'Removing all callbacks for scripts from all URLs' );
	getCallbacksMap().clear();
}

export function executeCallbacks( url: string, error: Error | null = null ) {
	const callbacksMap = getCallbacksMap();
	const callbacksForUrl = callbacksMap.get( url );

	if ( callbacksForUrl ) {
		const debugMessage =
			`Executing callbacks for "${ url }"` +
			( error === null ? ' with success' : ` with error "${ error }"` );
		debug( debugMessage );

		callbacksForUrl.forEach( cb => {
			if ( typeof cb === 'function' ) {
				cb( error );
			}
		} );

		callbacksMap.delete( url );
	}
}

export function handleRequestSuccess( this: HTMLScriptElement ) {
	const url = this.src;
	debug( `Handling successful request for "${ url }"` );
	executeCallbacks( url );
}

export function handleRequestError( this: HTMLScriptElement ) {
	const url = this.src;
	debug( `Handling failed request for "${ url }"` );
	executeCallbacks( url, new Error( `Failed to load script "${ url }"` ) );
}
