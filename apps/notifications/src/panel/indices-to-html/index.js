import React from 'react';
import ReactDOMServer from 'react-dom/server';

import Gridicon from '../templates/gridicons';
import noticon2gridicon from '../utils/noticon2gridicon';

/**
 * Create the actual DOM nodes for a given piece of text/ranges and
 * recurse downward into the range tree if necessary.
 *
 * @param {string} new_sub_text Plaintext on which ranges act
 * @param {Array} new_sub_range Position/applicable ranges array
 * @param {object} range_info The origin range data for this render
 * @param {Array} range_data All range data
 * @param {object} options
 * @returns {DocumentFragment} Computed DOM nodes for all levels at or below passed range
 */
function render_range( new_sub_text, new_sub_range, range_info, range_data, options ) {
	// Its time to build the outer shell of the range we're recursing into.
	let new_container = null,
		new_classes = [],
		type_mappings;

	let range_info_type = range_info.type;

	if ( typeof range_info.type !== 'undefined' ) {
		type_mappings = {
			b: 'strong', // be strong, my friend
			i: 'em', // I am, don't worry
			noticon: 'gridicon',
		};

		// Replace unwanted tags with more popular and cool ones
		if ( range_info.type in type_mappings ) {
			range_info_type = type_mappings[ range_info.type ];
		}

		new_classes.push( `wpnc__${ range_info_type }` );
	}

	// We want to do different things depending on the range type.
	switch ( range_info_type ) {
		// The badges should have their height and width set on
		// the server-side, but just in case they aren't, give
		// good defaults here
		case 'badge':
			if ( ! range_info.hasOwnProperty( 'width' ) ) {
				range_info.width = 256;
			}
			if ( ! range_info.hasOwnProperty( 'height' ) ) {
				range_info.height = 256;
			}
		case 'image':
			// Images and badges are not recursed into
			new_container = document.createElement( 'img' );
			new_container.setAttribute( 'src', range_info.url );
			if ( range_info.hasOwnProperty( 'width' ) ) {
				new_container.setAttribute( 'width', range_info.width );
			}
			if ( range_info.hasOwnProperty( 'height' ) ) {
				new_container.setAttribute( 'height', range_info.height );
			}
			if ( new_sub_text.trim().length > 0 ) {
				new_container.setAttribute( 'alt', new_sub_text );
			}
			break;
		// All of the following are simple element types we want to create and then
		// recurse into for their constituent blocks or texts
		case 'blockquote':
		case 'code':
		case 'strong':
		case 'em':
		case 'list':
			switch ( range_info_type ) {
				case 'list':
					range_info_type = 'span';
					break;
			}
			new_container = document.createElement( range_info_type );
			build_chunks( new_sub_text, new_sub_range, range_data, new_container, options );
			break;
		case 'gridicon':
			// Gridicons have special text, and are thus not recursed into
			new_container = document.createElement( 'span' );
			new_container.innerHTML = ReactDOMServer.renderToStaticMarkup(
				React.createElement( Gridicon, {
					icon: noticon2gridicon( range_info.value ),
					size: 18,
				} )
			);
			break;
		case 'button':
			new_classes.push( 'is-primary' );
		default:
			// Most range types fall here
			if ( options.links && range_info.url ) {
				// We are a link of some sort...
				new_container = document.createElement( 'a' );

				new_container.setAttribute( 'href', range_info.url );
				if ( range_info_type == 'stat' ) {
					// Stat links should change the whole window/tab
					new_container.setAttribute( 'target', '_parent' );
				} else {
					// Other links should link into a new window/tab
					new_container.setAttribute( 'target', '_blank' );
				}

				if ( 'post' === range_info.type ) {
					new_container.setAttribute( 'data-post-id', range_info.id );
					new_container.setAttribute( 'data-site-id', range_info.site_id );
					new_container.setAttribute( 'data-link-type', 'post' );
					new_container.setAttribute( 'target', '_self' );
				} else if ( 'tracks' === range_info.type && range_info.context ) {
					new_container.setAttribute( 'data-link-type', 'tracks' );
					new_container.setAttribute( 'data-tracks-event', range_info.context );
				}

				build_chunks( new_sub_text, new_sub_range, range_data, new_container, options );
			} else {
				// Everything else is a span
				new_container = document.createElement( 'span' );
				if ( new_sub_text.length > 0 ) {
					build_chunks( new_sub_text, new_sub_range, range_data, new_container, options );
				}
			}
			break;
	}

	if ( new_classes.length > 0 ) {
		new_container.className = new_classes.join( ' ' );
	}

	return new_container;
}

/**
 * Recurse into the data and produce DOM node output
 *
 * @param {string} sub_text  Plain-text upon which ranges act
 * @param {Array} sub_ranges Position/applicable ranges array
 * @param {Array} range_data All range data
 * @param {DocumentFragment} container Destination DOM fragment for output
 * @param {object} options
 */
function build_chunks( sub_text, sub_ranges, range_data, container, options ) {
	let text_start = null,
		text_stop = null,
		i,
		remove_r_id,
		r_id,
		sr_id,
		range_id,
		range_info,
		new_i,
		new_sub_text,
		new_sub_range;

	// We use sub_ranges and not sub_text because we *can* have an empty string with a range
	// acting upon it. For example an a tag with just an alt-text-less image tag inside of it
	for ( i = 0; i < sub_ranges.length; i++ ) {
		if ( sub_ranges[ i ].index.length == 0 ) {
			// This is a simple text element without applicable ranges
			if ( text_start == null ) {
				// This is the beginning of the text element
				text_start = i;
			}
		} else {
			if ( text_start != null ) {
				text_stop = i;
				// We're in a range now, but, we were just in text,
				// so create the DOM elements for the just-finished text range
				container.appendChild(
					document.createTextNode( sub_text.substring( text_start, text_stop ) )
				);
				text_start = null;
				text_stop = null;
			}

			// At this point we have one or more ranges we could be entering. We need to decide
			// which one. For recursion to work we must pick the longest range. If there are
			// ties for longest range from this position then it doesn't matter which one wins.
			// This may not be true for all cases forever. If we find a bug where a particular
			// range needs to win out over another then this is the place for that logic.
			//
			// sub_ranges[i].index looks like:
			// [ { id: [index of range in range_data], len: [span of range indices] }, { id: x, len: y }, ..., { id: n, len: m } ]
			remove_r_id = null;
			for ( r_id in sub_ranges[ i ].index ) {
				if (
					null === remove_r_id ||
					sub_ranges[ i ].index[ r_id ].len > sub_ranges[ i ].index[ remove_r_id ].len
				) {
					remove_r_id = r_id;
				}
			}

			// Since we've picked a range we'll record some information for future reference
			range_id = sub_ranges[ i ].index[ remove_r_id ].id; // To be able to reference thr origin range
			range_info = range_data[ range_id ]; // the origin range data
			new_i = i + sub_ranges[ i ].index[ remove_r_id ].len - 1; // the position we will be jumping to after resursing
			new_sub_text = sub_text.substring( i, i + sub_ranges[ i ].index[ remove_r_id ].len ); // the text we will be recursing with
			new_sub_range = sub_ranges.slice( i, 1 + i + sub_ranges[ i ].index[ remove_r_id ].len ); // the new ranges we'll be recursing with

			// Remove the range we are recursing into from the ranges we're recursing with.
			// Otherwise we will end up in an infinite loop and everybody will be mad at us.
			for ( sr_id = 0; sr_id < new_sub_range.length; sr_id++ ) {
				new_sub_range[ sr_id ].index.splice( remove_r_id, 1 );
			}

			container.appendChild(
				render_range( new_sub_text, new_sub_range, range_info, range_data, options )
			);
			i = new_i;
		}
	}
	if ( text_start != null ) {
		// We're done, at and below this depth but we finished in a text range, so we need to
		// handle the last bit of text
		container.appendChild(
			document.createTextNode( sub_text.substring( text_start, sub_text.length ) )
		);
	}
	// Just in case we have anything like a bunch of small Text() blocks together, etc, lets
	// normalize the document
	container.normalize();
}

/**
 * Takes an array of range objects and returns the array index
 * for the first range with the longest span, meaning that if
 * there are multiple longest ranges with the same indices, the
 * index for the first one in the array will be returned.
 *
 * @param {Array} rs Range objects, having at least { indices: [ start, end ] }
 * @returns {number|null} Index in the range array with the longest span between indices or null if no valid ranges
 */
function find_largest_range( rs ) {
	let r_id = -1,
		r_size = 0,
		i;

	if ( rs.length < 1 ) {
		return null;
	}

	for ( i = 0; i < rs.length; i++ ) {
		if ( null === rs[ i ] ) {
			continue;
		}

		// Set on first valid range and subsequently larger ranges
		if ( -1 === r_id || rs[ i ].indices[ 1 ] - rs[ i ].indices[ 0 ] > r_size ) {
			r_id = i;
			r_size = rs[ i ].indices[ 1 ] - rs[ i ].indices[ 0 ];
		}
	}

	return r_id;
}

function recurse_convert( text, ranges, options ) {
	const container = document.createDocumentFragment();
	const ranges_copy = JSON.parse( JSON.stringify( ranges ) ); // clone through serialization
	const t = []; // Holds the range information for each position in the text
	let i;
	let id;
	let n;
	let range_len;

	// Create a representation of the string as an array of
	// positions, each holding a list of ranges that apply to that
	// position.
	//
	// e.g.
	//           1         2
	// 012345678901234567890 : character position
	//  aaaaaaa    bbbbbbbbb : underneath is the list of
	//    ccccc       dd  ee : applicable ranges, going
	//      fff        g     : from top to bottom in order
	//                       : of longest to shortest ranges
	//
	// Step 1: Create the empty array of positions
	for ( i = 0; i <= text.length; i++ ) {
		t[ i ] = { index: [] };
	}

	// Step 2: in order of largest to smallest, add the information
	// for the applicable ranges for each position in the text. Since
	// the ranges _should be_ guaranteed to be valid and non-overlapping,
	// we can see from the diagram above that ordering them from largest
	// to smallest gives us the proper order for descending recursively.
	for ( i = 0; i < ranges_copy.length; i++ ) {
		id = find_largest_range( ranges_copy );
		if ( ranges[ id ].indices[ 1 ] == 0 && ranges[ id ].indices[ 1 ] == 0 ) {
			// Indices covering 0,0 are special cases only. They always go at the very
			// beginning of the document, are never nested, and are always "empty"
			// If there are multiple zero-length ranges, they will return in the order
			// they appear.
			container.appendChild( render_range( '', [], ranges[ id ], ranges, options ) );
		} else {
			range_len = ranges[ id ].indices[ 1 ] - ranges[ id ].indices[ 0 ];
			for ( n = ranges[ id ].indices[ 0 ]; n <= ranges[ id ].indices[ 1 ]; n++ ) {
				t[ n ].index.push( { id: id, len: range_len } );
			}
		}
		// Clear out the currently-selected range so that it won't
		// return as the largest range in the next loop iteration
		ranges_copy[ id ] = null;
	}

	// Create a document fragment, and fill it with recursively built chunks of things.
	build_chunks( text, t, ranges, container, options );
	return container;
}

export function convert( blob, options ) {
	let ranges = new Array();
	options = options || {};
	options.links = 'undefined' === typeof options.links ? true : options.links;
	ranges = ranges.concat( blob.ranges || [] );
	ranges = ranges.concat( blob.media || [] );
	return recurse_convert( blob.text, ranges, options );
}

export function html( blob, options ) {
	const div = document.createElement( 'div' );
	div.appendChild( convert( blob, options ) );
	return div.innerHTML;
}

export default convert;
