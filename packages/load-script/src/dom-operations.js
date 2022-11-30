import debugFactory from 'debug';
import { handleRequestError, handleRequestSuccess } from './callback-handler';

const debug = debugFactory( 'lib/load-script/dom-operations' );

export function createScriptElement( url, args ) {
	debug( `Creating script element for "${ url }"` );
	const script = document.createElement( 'script' );

	script.src = url;
	script.type = 'text/javascript';
	script.async = true;
	script.onload = handleRequestSuccess;
	script.onerror = handleRequestError;

	if ( args ) {
		Object.entries( args ).forEach( ( [ key, value ] ) => {
			if ( ! value ) {
				script.removeAttribute( key );
			} else {
				script.setAttribute( key, value );
			}
		} );
	}

	return script;
}

export function attachToHead( element ) {
	debug( 'Attaching element to head' );
	document.head.appendChild( element );
}
