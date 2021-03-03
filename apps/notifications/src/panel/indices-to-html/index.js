/**
 * External dependencies
 */
import React from 'react';
import ReactDOMServer from 'react-dom/server';

/**
 * Internal dependencies
 */
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
 * @param {object} options Options for rendering range
 * @returns {object} Computed DOM nodes for all levels at or below passed range
 */
function render_range( new_sub_text, new_sub_range, range_info, range_data, options ) {
	// Its time to build the outer shell of the range we're recursing into.
	let new_container = null;
	let type_mappings;
	const new_classes = [];

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
		case 'cite':
		case 'hr':
		case 'p':
		case 'br':
		case 'div':
		case 'code':
		case 'pre':
		case 'span':
		case 'strong':
		case 'em':
		case 'sub':
		case 'sup':
		case 'del':
		case 's':
		case 'ol':
		case 'ul':
		case 'li':
		case 'h1':
		case 'h2':
		case 'h3':
		case 'h4':
		case 'h5':
		case 'h6':
		case 'figure':
		case 'figcaption':
			switch ( range_info_type ) {
				case 'list':
					range_info_type = 'span';
					break;
			}
			new_container = document.createElement( range_info_type );
			if ( range_info.hasOwnProperty( 'class' ) ) {
				new_classes.push( range_info.class );
			}
			if ( range_info.hasOwnProperty( 'style' ) ) {
				new_container.setAttribute( 'style', range_info.style );
			}
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
			if ( ( options.links && range_info.url ) || range_info_type === 'a' ) {
				// We are a link of some sort...
				new_container = document.createElement( 'a' );
				new_container.setAttribute( 'href', range_info.url );
				if ( range_info.hasOwnProperty( 'class' ) ) {
					new_classes.push( range_info.class );
				}
				if ( range_info.hasOwnProperty( 'style' ) ) {
					new_container.setAttribute( 'style', range_info.style );
				}
				if ( range_info_type === 'stat' ) {
					// Stat links should change the whole window/tab
					new_container.setAttribute( 'target', '_parent' );
				} else {
					// Other links should link into a new window/tab
					new_container.setAttribute( 'target', '_blank' );
					new_container.setAttribute( 'rel', 'noopener noreferrer' );
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
 * @param {object} container Destination DOM fragment for output
 * @param {object} options Options for building chunks
 */
function build_chunks( sub_text, sub_ranges, range_data, container, options ) {
	let text_start = null;
	let text_stop = null;

	const ranges = JSON.parse( JSON.stringify( sub_ranges ) ); // clone through serialization

	// We use sub_ranges and not sub_text because we *can* have an empty string with a range
	// acting upon it. For example an a tag with just an alt-text-less image tag inside of it
	for ( let i = 0; i < sub_ranges.length; i++ ) {
		if ( ranges[ i ].length === 0 ) {
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
			// which one. If we find a bug where a particular range needs to win out over another
			// then this is the place for that logic.
			//
			// ranges[i] looks like:
			// [ { pos: [position of range in range_data], len: [span of range indices] }, { pos: x, len: y }, ..., { pos: n, len: m } ]
			let range = null;
			for ( const potential_range of ranges[ i ] ) {
				// For recursion to work we must pick a range that does not have a parent in the
				// current set of ranges.
				if ( potential_range.parent ) {
					const parent_range = ranges[ i ].find( ( r ) => r.id === potential_range.parent );
					if ( parent_range ) {
						continue;
					}
				}

				// If there are multiple ranges without a parent, then we give priority to empty
				// ranges so they are not rendered inside a sibling range sharing the same starting
				// position.
				if ( potential_range.len === 0 ) {
					range = potential_range;
					break;
				}

				// Otherwise we pick the longest range.
				if ( null === range || potential_range.len > range.len ) {
					range = potential_range;
				}
			}

			// Since we've picked a range we'll record some information for future reference.
			const range_info = range_data[ range.pos ]; // The origin range data.
			const new_sub_text = sub_text.substr( i, range.len ); // The text we will be recursing with.
			const new_sub_range = sub_ranges.slice( i, i + ( range.len > 0 ? range.len : 1 ) ); // The new ranges we'll be recursing with.

			for ( let j = 0; j < new_sub_range.length; j++ ) {
				// Remove siblings ranges we are recursing into from the ranges we're recursing with.
				// Otherwise we will end up in an infinite loop and everybody will be mad at us.
				new_sub_range[ j ] = new_sub_range[ j ].filter( ( r ) => range.parent !== r.parent );
			}

			container.appendChild(
				render_range( new_sub_text, new_sub_range, range_info, range_data, options )
			);

			// Remove empty ranges from the current position so they are not picked again during the
			// next iteration if the position doesn't change (only possible if the picked range for
			// the current iteration is empty).
			ranges[ i ] = ranges[ i ].filter( ( sub_range ) => sub_range.len > 0 );

			i += range.len - 1; // The position we will be jumping to after recursing.
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

function recurse_convert( text, ranges, options ) {
	const container = document.createDocumentFragment();
	const ranges_copy = JSON.parse( JSON.stringify( ranges ) ); // clone through serialization
	const t = []; // Holds the range information for each position in the text

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
	if ( text.length > 0 ) {
		for ( let i = 0; i < text.length; i++ ) {
			t[ i ] = [];
		}
	} else {
		t.push( [] );
	}

	// Step 2: in order of largest to smallest, add the information
	// for the applicable ranges for each position in the text. Since
	// the ranges _should be_ guaranteed to be valid and non-overlapping,
	// we can see from the diagram above that ordering them from largest
	// to smallest gives us the proper order for descending recursively.
	ranges_copy.forEach( ( range, pos ) => {
		const { id, parent, indices } = range;
		const start = indices[ 0 ];
		const stop = indices[ 1 ];
		const len = stop - start;
		if ( len > 0 ) {
			for ( let i = start; i < stop; i++ ) {
				t[ i ].push( { id, len, parent, pos } );
			}
		} else {
			if ( typeof t[ start ] === 'undefined' ) {
				t[ start ] = [];
			}
			t[ start ].push( { id, len, parent, pos } );
		}
	} );

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
