/**
 * Internal dependencies
 */

import { MediaTypes } from '../constants';

/**
 * Module variables
 */
const REGEXP_IMG_CLASS_SIZE = /\bsize-(\w+)\b/;
const REGEXP_IMG_CLASS_ID = /\bwp-image-((media-)?\d+)\b/;
const REGEXP_IMG_CLASS_ALIGN = /\balign(left|center|right|none)\b/;

/**
 * Given an <img /> HTMLElement, returns an object of parsed attributes.
 *
 * @param  {HTMLElement} node    <img /> HTMLElement
 * @param  {object}      _parsed In recursion, the known values
 * @returns {object}              Object of all detected values
 */
function parseImage( node, _parsed ) {
	_parsed.type = MediaTypes.IMAGE;
	_parsed.media.URL = node.getAttribute( 'src' );
	_parsed.media.alt = node.getAttribute( 'alt' );
	// consider data-istransient a boolean attribute https://html.spec.whatwg.org/multipage/common-microsyntaxes.html#boolean-attribute
	// will only be false if it doesn't exist
	_parsed.media.transient = node.hasAttribute( 'data-istransient' );

	// Parse dimensions
	[ 'width', 'height' ].forEach( ( dimension ) => {
		let natural = 'natural' + dimension[ 0 ].toUpperCase() + dimension.slice( 1 ),
			value = node.getAttribute( dimension ) || node[ natural ] || node[ dimension ];

		if ( value && isFinite( value ) ) {
			_parsed.media[ dimension ] = parseInt( value, 10 );
		}
	} );

	// Parse size from class name
	if ( REGEXP_IMG_CLASS_SIZE.test( node.className ) ) {
		_parsed.appearance.size = node.className.match( REGEXP_IMG_CLASS_SIZE )[ 1 ];
	}

	// Parse alignment from class name
	if ( REGEXP_IMG_CLASS_ALIGN.test( node.className ) ) {
		_parsed.appearance.align = node.className.match( REGEXP_IMG_CLASS_ALIGN )[ 1 ];
	}

	// Parse ID from class name
	if ( REGEXP_IMG_CLASS_ID.test( node.className ) ) {
		_parsed.media.ID = node.className.match( REGEXP_IMG_CLASS_ID )[ 1 ];

		if ( isFinite( _parsed.media.ID ) ) {
			_parsed.media.ID = parseInt( _parsed.media.ID, 10 );
		}
	}

	return _parsed;
}

/**
 * Given a media HTMLElement object, returns an object containing all detected
 * values.
 *
 * @param  {HTMLElement} node    Media object to parse
 * @param  {object}      _parsed In recursion, the known values
 * @returns {object}              Object of all detected values
 */
export function deserialize( node, _parsed = { media: {}, appearance: {} } ) {
	switch ( node.nodeName ) {
		case 'IMG':
			_parsed = parseImage( node, _parsed );
			break;
	}

	return _parsed;
}
