/**
 * External dependencies
 */
import { Falsy } from 'utility-types';

interface Stringable {
	toString: () => string;
}

function decodeIfValid(
	encodedItem: Stringable | Falsy,
	decodingFunction: ( item: string ) => string
) {
	const encodedURIString: string =
		encodedItem && encodedItem.toString ? encodedItem.toString() : '';

	try {
		return decodingFunction( encodedURIString );
	} catch ( e ) {
		return encodedURIString;
	}
}

/**
 * Wrap decodeURI in a try / catch block to prevent `URIError` on invalid input
 * Passing a non-string value will return an empty string.
 * @param  encodedURI URI to attempt to decode
 * @returns            Decoded URI (or passed in value on error)
 */
export function decodeURIIfValid( encodedURI: Stringable | Falsy ): string {
	return decodeIfValid( encodedURI, decodeURI );
}

/**
 * Wrap decodeURIComponent in a try / catch block to prevent `URIError` on invalid input
 * Passing a non-string value will return an empty string.
 * @param  encodedURIComponent URI component to attempt to decode
 * @returns                     Decoded URI component (or passed in value on error)
 */
export function decodeURIComponentIfValid( encodedURIComponent: Stringable | Falsy ): string {
	return decodeIfValid( encodedURIComponent, decodeURIComponent );
}
