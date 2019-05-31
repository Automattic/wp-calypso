/**
 * External dependencies
 */
import { registerPlugin } from '@wordpress/plugins';
import { isObjectLike, isUndefined, omit } from 'lodash';
import debug from 'debug';
const tracksDebug = debug( 'wpcom-block-editor:analytics:tracks' );

// In case Tracks hasn't loaded
if ( typeof window !== 'undefined' ) {
	window._tkq = window._tkq || [];
}

// Adapted from the analytics lib :(
// Because this is happening outside of the Calypso app we can't reuse the same lib
// This means we don't have any extra props like user
const tracksRecordEvent = function( eventName, eventProperties ) {
	eventProperties = eventProperties || {};

	if ( process.env.NODE_ENV !== 'production' && typeof console !== 'undefined' ) {
		for ( const key in eventProperties ) {
			if ( isObjectLike( eventProperties[ key ] ) ) {
				const errorMessage =
					`Tracks: Unable to record event "${ eventName }" because nested ` +
					`properties are not supported by Tracks. Check '${ key }' on`;
				console.error( errorMessage, eventProperties ); //eslint-disable-line no-console
				return;
			}

			if ( ! /^[a-z_][a-z0-9_]*$/.test( key ) ) {
				//eslint-disable-next-line no-console
				console.error(
					'Tracks: Event `%s` will be rejected because property name `%s` does not match /^[a-z_][a-z0-9_]*$/. ' +
						'Please use a compliant property name.',
					eventName,
					key
				);
			}
		}
	}

	// Remove properties that have an undefined value
	// This allows a caller to easily remove properties from the recorded set by setting them to undefined
	eventProperties = omit( eventProperties, isUndefined );

	tracksDebug( 'Recording event "%s" with actual props %o', eventName, eventProperties );

	if ( 'undefined' !== typeof window ) {
		window._tkq.push( [ 'recordEvent', eventName, eventProperties ] );
	}
};

const trackGutenbergSearch = event => {
	const searchTerm = event.target.value;
	const hasResults =
		document.getElementsByClassName( 'block-editor-inserter__no-results' ).length === 0;

	if ( searchTerm.length < 3 ) {
		return;
	}

	tracksRecordEvent( 'wpcom_block_picker_search_term', {
		search_term: searchTerm,
	} );

	if ( hasResults ) {
		return;
	}

	// Create a separate event for search with no results to make it easier to filter by them
	tracksRecordEvent( 'wpcom_block_picker_no_results', {
		search_term: searchTerm,
	} );
};

registerPlugin( 'track-no-search-results', {
	render: () => {
		document.onkeyup = event => {
			if ( event.target.id.indexOf( 'block-editor-inserter__search' ) === 0 ) {
				trackGutenbergSearch( event );
			}
		};

		return null;
	},
} );
