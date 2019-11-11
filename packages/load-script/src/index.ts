/**
 * A little module for loading a external script
 */

/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { addScriptCallback, isLoading } from './callback-handler';
import { createScriptElement, attachToHead } from './dom-operations';
import { ScriptCallback } from './types';

const debug = debugFactory( 'package/load-script' );

// NOTE: This exists for compatibility.
export { removeScriptCallback } from './callback-handler';

/**
 * Module variables
 */
export const JQUERY_URL = 'https://s0.wp.com/wp-includes/js/jquery/jquery.js';

/**
 *
 * @param url      Script URL
 * @param callback Callback invoked on load or error
 */
export function loadScript( url: string, callback: ScriptCallback ): void;
/**
 * Load a script, returns a Promise
 *
 * @param url Script URL
 */
export function loadScript( url: string ): Promise< void >;
export function loadScript( url: string, callback?: ScriptCallback ): void | Promise< void > {
	// If this script is not currently being loaded, create a script element and attach to document head.
	const shouldLoadScript = ! isLoading( url );
	if ( shouldLoadScript ) {
		// the onload/onerror callbacks are guaranteed to be called asynchronously, so it's ok to first
		// add the element and only then attach callbacks, as long as it happens in one event loop tick.
		attachToHead( createScriptElement( url ) );
	}

	// if callback is provided, behave traditionally
	if ( typeof callback === 'function' ) {
		addScriptCallback( url, callback );
		return;
	}

	// but if not, return a Promise
	return new Promise( ( resolve, reject ) => {
		addScriptCallback( url, error => {
			if ( error === null ) {
				resolve();
			} else {
				reject( error );
			}
		} );
	} );
}

export function loadjQueryDependentScript( url: string, callback: ScriptCallback ) {
	debug( `Loading a jQuery dependent script from "${ url }"` );

	if ( ( window as { jQuery?: unknown } ).jQuery ) {
		debug( `jQuery found on window, skipping jQuery script loading for "${ url }"` );
		return loadScript( url, callback );
	}

	const loadPromise = loadScript( JQUERY_URL ).then( () => loadScript( url ) );

	// if callback is provided, call it on resolution
	if ( typeof callback === 'function' ) {
		loadPromise.then( () => callback( null ), error => callback( error ) );
		return;
	}

	// if not, return the Promise
	return loadPromise;
}
