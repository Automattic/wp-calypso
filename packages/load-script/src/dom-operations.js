import debugFactory from 'debug';
import { handleRequestError, handleRequestSuccess } from './callback-handler';

const debug = debugFactory( 'lib/load-script/dom-operations' );

export function createScriptElement( url, args ) {
	debug( `Creating script element for "${ url }"` );
	const script = document.createElement( 'script' );

	script.src = url;
	script.type = 'text/javascript';
	script.onload = handleRequestSuccess;
	script.onerror = handleRequestError;
	script.async = true;

	if ( args ) {
		Object.entries( args ).forEach( ( [ key, value ] ) => ( script[ key ] = value ) );
	}

	return script;
}

export function attachToHead( element ) {
	debug( 'Attaching element to head' );
	document.head.appendChild( element );
}
