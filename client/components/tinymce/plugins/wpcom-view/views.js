/**
 * External dependencies
 */
import EventEmitter from 'events/';
import forEach from 'lodash/collection/forEach';
import pluck from 'lodash/collection/pluck';
import mapValues from 'lodash/object/mapValues';
import values from 'lodash/object/values';

/**
 * Internal dependencies
 */
import config from 'config';
import GalleryView from './gallery-view';
import EmbedViewManager from './views/embed';
import ContactFormView from './contact-form-view';

/**
 * Module variables
 */
let views = {
	gallery: GalleryView,
	embed: new EmbedViewManager()
};

if ( config.isEnabled( 'post-editor/contact-form' ) ) {
	views.contact = ContactFormView;
}

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
	 * @param {String} content The string to scan.
	 *
	 * @return {String} The string with markers.
	 */
	setMarkers( content ) {
		var pieces = [ { content: content } ],
			current;

		forEach( views, function( view, type ) {
			current = pieces.slice();
			pieces = [];

			forEach( current, function( piece ) {
				var remaining = piece.content,
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
						content: '<p class="wpview-marker" data-wpview-text="' + view.serialize( result.content, result.options ) + '" data-wpview-type="' + type + '">.</p>',
						processed: true
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

		content = pluck( pieces, 'content' ).join( '' );
		return content.replace( /<p>\s*<p data-wpview-marker=/g, '<p data-wpview-marker=' ).replace( /<\/p>\s*<\/p>/g, '</p>' );
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

	emitters: emitters

};
