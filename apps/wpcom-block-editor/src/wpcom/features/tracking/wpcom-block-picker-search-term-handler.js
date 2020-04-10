/* eslint-disable import/no-extraneous-dependencies */

/**
 * External dependencies
 */
import { debounce } from 'lodash';
import debug from 'debug';

/**
 * WordPress dependencies
 */
import { select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import tracksRecordEvent from './track-record-event';

const tracksDebug = debug( 'wpcom-block-editor:analytics:tracks:block-search' );

let lastSearchTerm;
const trackSearchTerm = ( event, target ) => {
	const key = event.key || event.keyCode;
	const search_term = ( target.value || '' ).trim().toLowerCase();

	if ( lastSearchTerm === search_term && 'Enter' !== key ) {
		return tracksDebug( 'Same term: %o, type %o key. Skip.', search_term, key );
	}
	lastSearchTerm = search_term;

	if ( search_term.length < 3 ) {
		return;
	}

	const eventProperties = {
		search_term,
		context: 'inserter_menu',
	};

	/*
	 * Populate event properties with `selected_block`
	 * if there is a selected block in the editor.
	 */
	const selectedBlock = select( 'core/block-editor' ).getSelectedBlock();
	if ( selectedBlock ) {
		eventProperties.selected_block = selectedBlock.name;
	}

	tracksRecordEvent( 'wpcom_block_picker_search_term', { ...eventProperties } );

	// Create a separate event for search with no results to make it easier to filter by them
	const hasResults = document.querySelectorAll( '.block-editor-inserter__no-results' ).length === 0;
	if ( hasResults ) {
		return;
	}

	tracksRecordEvent( 'wpcom_block_picker_no_results', { ...eventProperties } );
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
