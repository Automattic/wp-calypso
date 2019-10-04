/**
 * Internal dependencies
 */
import { URL as URLType } from 'types';

interface Stringable {
	toString: () => string;
}

/**
 * Wrap decodeURI in a try / catch block to prevent `URIError` on invalid input
 * Passing a non-string value will return an empty string.
 * @param  encodedURI URI to attempt to decode
 * @return            Decoded URI (or passed in value on error)
 */
export function decodeURIIfValid( encodedURI: string | Stringable ): URLType {
	let encodedURIString: string;

	if ( encodedURI as Stringable ) {
		encodedURIString = encodedURI.toString();
	} else {
		encodedURIString = encodedURI as string;
	}

	if ( typeof encodedURIString !== 'string' ) {
		return '';
	}

	try {
		return decodeURI( encodedURIString );
	} catch ( e ) {
		return encodedURIString;
	}
}

/**
 * Wrap decodeURIComponent in a try / catch block to prevent `URIError` on invalid input
 * Passing a non-string value will return an empty string.
 * @param  encodedURIComponent URI component to attempt to decode
 * @return                     Decoded URI component (or passed in value on error)
 */
export function decodeURIComponentIfValid( encodedURIComponent: string | Stringable ): string {
	let encodedURIComponentString: string;

	if ( encodedURIComponent as Stringable ) {
		encodedURIComponentString = encodedURIComponent.toString();
	} else {
		encodedURIComponentString = encodedURIComponent as string;
	}

	if ( typeof encodedURIComponentString !== 'string' ) {
		return '';
	}

	try {
		return decodeURIComponent( encodedURIComponentString );
	} catch ( e ) {
		return encodedURIComponentString;
	}
}
