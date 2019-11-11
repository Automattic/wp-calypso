/**
 * External dependencies
 */
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import { handleRequestError, handleRequestSuccess } from './callback-handler';

const debug = debugFactory( 'lib/load-script/dom-operations' );

export function createScriptElement( url: string ) {
	debug( `Creating script element for "${ url }"` );
	const script = document.createElement( 'script' );
	script.src = url;
	script.type = 'text/javascript';
	script.async = true;
	script.addEventListener( 'load', handleRequestSuccess, { once: true } );
	script.addEventListener( 'error', handleRequestError, { once: true } );
	return script;
}

export function attachToHead( node: Node ) {
	debug( 'Attaching element to head' );
	document.head.appendChild( node );
}
