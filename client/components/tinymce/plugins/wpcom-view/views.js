/**
 * External dependencies
 */

import EventEmitter from 'events';
import { forEach, map, mapValues, values } from 'lodash';

/**
 * Internal dependencies
 */
import GalleryView from './gallery-view';
import EmbedViewManager from './views/embed';
import * as ContactFormView from './views/contact-form';
import * as VideoView from './views/video';
import SimplePaymentsView from './views/simple-payments';

/**
 * Module variables
 */
const views = {
	gallery: GalleryView,
	embed: new EmbedViewManager(),
	contactForm: ContactFormView,
	video: VideoView,
	simplePayments: SimplePaymentsView,
};

const components = mapValues( views, ( view ) => {
	if ( 'function' === typeof view.getComponent ) {
		return view.getComponent();
	}

	return view;
} );

const emitters = values( views ).filter( ( view ) => view instanceof EventEmitter );

export default {
	/**
	 * Scans a given string for each view's pattern,
	 * replacing any matches with markers,
	 * and creates a new instance for every match.
	 *
	 * @param   {string} content The string to scan.
	 * @returns {string}         The string with markers.
	 */
	setMarkers( content ) {
		let pieces = [ { content: content } ],
			current;

		forEach( views, function ( view, type ) {
			current = pieces.slice();
			pieces = [];

			forEach( current, function ( piece ) {
				let remaining = piece.content,
					result;

				// Ignore processed pieces, but retain their location.
				if ( piece.processed ) {
					pieces.push( piece );
					return;
				}

				// Iterate through the string progressively matching views
				// and slicing the string as we go.
				while ( remaining && ( result = view.match( remaining ) ) ) {
					// Any text before the match becomes an unprocessed piece.
					if ( result.index ) {
						pieces.push( { content: remaining.substring( 0, result.index ) } );
					}

					// Add the processed piece for the match.
					pieces.push( {
						content:
							'<p class="wpview-marker" data-wpview-text="' +
							view.serialize( result.content, result.options ) +
							'" data-wpview-type="' +
							type +
							'">.</p>',
						processed: true,
					} );

					// Update the remaining content.
					remaining = remaining.slice( result.index + result.content.length );
				}

				// There are no additional matches.
				// If any content remains, add it as an unprocessed piece.
				if ( remaining ) {
					pieces.push( { content: remaining } );
				}
			} );
		} );

		content = map( pieces, 'content' ).join( '' );
		return content
			.replace( /<p>\s*<p data-wpview-marker=/g, '<p data-wpview-marker=' )
			.replace( /<\/p>\s*<\/p>/g, '</p>' );
	},

	isEditable( type ) {
		return !! ( views[ type ] && views[ type ].edit );
	},

	edit( type, editor, content ) {
		if ( ! this.isEditable( type ) ) {
			return;
		}

		views[ type ].edit( editor, content );
	},

	components: components,

	emitters: emitters,
};
