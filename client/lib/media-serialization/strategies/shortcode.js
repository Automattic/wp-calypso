/**
 * Internal dependencies
 */

import { deserialize as _recurse } from '../';

/**
 * Module variables
 */
const REGEXP_CAPTION_CONTENT = /((?:<a [^>]+>)?<img [^>]+>(?:<\/a>)?)([\s\S]*)/i;
const REGEXP_CAPTION_ID = /attachment_(\d+)/;
const REGEXP_CAPTION_ALIGN = /align(\w+)/;

/**
 * Given a caption shortcode object, returns an object of parsed attributes.
 *
 * @param  {object} node    Caption shortcode object
 * @param  {object} _parsed In recursion, the known values
 * @returns {object}         Object of all detected values
 */
function parseCaption( node, _parsed ) {
	// Pull named attributes
	if ( node.attrs && node.attrs.named ) {
		// Caption align is suffixed with "align"
		if ( REGEXP_CAPTION_ALIGN.test( node.attrs.named.align ) ) {
			_parsed.appearance.align = node.attrs.named.align.match( REGEXP_CAPTION_ALIGN )[ 1 ];
		}

		// Caption ID is suffixed with "attachment_"
		if ( REGEXP_CAPTION_ID.test( node.attrs.named.id ) ) {
			_parsed.media.ID = parseInt( node.attrs.named.id.match( REGEXP_CAPTION_ID )[ 1 ], 10 );
		}

		// Extract dimensions
		if ( _parsed.media.width && isFinite( node.attrs.named.width ) ) {
			_parsed.media.width = parseInt( node.attrs.named.width, 10 );
		}
	}

	// If shortcode contains no content, we're finished at this point
	if ( ! node.content ) {
		return _parsed;
	}

	// Extract shortcode content, including caption text as sibling
	// adjacent to the image itself.
	const img = node.content.match( REGEXP_CAPTION_CONTENT );
	if ( img && img[ 2 ] ) {
		_parsed.media.caption = img[ 2 ].trim();
	}

	// If content contains image in addition to caption text, continue
	// to parse the image
	if ( img ) {
		return _recurse( img[ 1 ], _parsed );
	}

	return _parsed;
}

/**
 * Given a media shortcode object, returns an object containing all detected
 * values.
 *
 * @param  {object} node    Media shortcode object to parse
 * @param  {object} _parsed In recursion, the known values
 * @returns {object}         Object of all detected values
 */
export function deserialize( node, _parsed = { media: {}, appearance: {} } ) {
	switch ( node.tag ) {
		case 'caption':
			_parsed = parseCaption( node, _parsed );
			break;
	}

	return _parsed;
}
