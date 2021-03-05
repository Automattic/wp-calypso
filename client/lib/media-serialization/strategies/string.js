/**
 * Internal dependencies
 */
import { parse } from 'calypso/lib/shortcode';
import { deserialize as _recurse } from '../';
import createElementFromString from '../create-element-from-string';

/**
 * Given a media string, attempts to parse as a shortcode and returns an
 * object containing all detected values.
 *
 * @param  {string} node    Media object to parse
 * @param  {object} _parsed In recursion, the known values
 * @returns {object}         Object of all detected values
 */
function parseAsShortcode( node, _parsed ) {
	// Attempt to convert string element into DOM node. If successful, recurse
	// to trigger the shortcode strategy
	const shortcode = parse( node );
	if ( shortcode ) {
		return _recurse( shortcode, _parsed );
	}

	return _parsed;
}

/**
 * Given a media string, attempts to parse as an HTMLElement and returns an
 * object containing all detected values.
 *
 * @param  {string} node    Media object to parse
 * @param  {object} _parsed In recursion, the known values
 * @returns {object}         Object of all detected values
 */
function parseAsElement( node, _parsed ) {
	// Attempt to convert string element into DOM node. If invalid, this will
	// return a string, not window.Element
	const element = createElementFromString( node );
	if ( element instanceof window.Element ) {
		// Recursing will trigger the DOM strategy
		return _recurse( element, _parsed );
	}

	return _parsed;
}

/**
 * Given a media string, returns an object containing all detected values.
 *
 * @param  {string} node    Media object to parse
 * @param  {object} _parsed In recursion, the known values
 * @returns {object}         Object of all detected values
 */
export function deserialize( node, _parsed = { media: {}, appearance: {} } ) {
	return [ parseAsShortcode, parseAsElement ].reduce( ( memo, parse ) => {
		return Object.assign( memo, parse( node, _parsed ) );
	}, {} );
}
