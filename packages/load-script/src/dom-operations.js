import debugFactory from 'debug';
import { handleRequestError, handleRequestSuccess } from './callback-handler';

const debug = debugFactory( 'lib/load-script/dom-operations' );

function setScriptOption( script, key, value ) {
	// data-/aria- keys must be real attributes (script['data-*'] is not valid DOM mapping).
	if ( key.startsWith( 'data-' ) || key.startsWith( 'aria-' ) ) {
		script.setAttribute( key, value );
		return;
	}

	script[ key ] = value;
}

export function createScriptElement( url, args ) {
	debug( `Creating script element for "${ url }"` );
	const script = document.createElement( 'script' );

	script.src = url;
	script.type = 'text/javascript';
	script.onload = handleRequestSuccess;
	script.onerror = handleRequestError;
	script.async = true;

	if ( args ) {
		Object.entries( args ).forEach( ( [ key, value ] ) => setScriptOption( script, key, value ) );
	}

	return script;
}

export function attachToHead( element ) {
	debug( 'Attaching element to head' );
	document.head.appendChild( element );
}
