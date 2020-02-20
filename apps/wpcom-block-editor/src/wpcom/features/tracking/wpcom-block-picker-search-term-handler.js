/* eslint-disable import/no-extraneous-dependencies */

/**
 * External dependencies
 */
import { debounce } from 'lodash';

/**
 * Internal dependencies
 */
import tracksRecordEvent from './track-record-event';

const trackSearchTerm = ( event, target ) => {
	const search_term = ( target.value || '' ).trim().toLowerCase();

	if ( search_term.length < 3 ) {
		return;
	}

	tracksRecordEvent( 'wpcom_block_picker_search_term', { search_term } );

	// Create a separate event for search with no results to make it easier to filter by them
	const hasResults = document.querySelectorAll( '.block-editor-inserter__no-results' ).length === 0;
	if ( hasResults ) {
		return;
	}

	tracksRecordEvent( 'wpcom_block_picker_no_results', { search_term } );
};

/**
 * Return the event definition object to track `wpcom_block_picker_no_results`.
 * Also, it tracks `wpcom_block_picker_no_results` is the searcher doesn't return any result.
 *
 * @returns {{handler: Function, selector: string, type: string}} event object definition.
 */
export default () => ( {
	selector: '.block-editor-inserter__search',
	type: 'keyup',
	handler: debounce( trackSearchTerm, 500 ),
} );
