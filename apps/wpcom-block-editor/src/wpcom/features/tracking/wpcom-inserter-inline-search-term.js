/* eslint-disable import/no-extraneous-dependencies */

/**
 * External dependencies
 */
import { debounce, get } from 'lodash';

/**
 * WordPress dependencies
 */
import { select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import tracksRecordEvent from './track-record-event';

/**
 * Handles search tracking from "Autocomplete / Block" component.
 *
 * Depends on a valid target, which was previously handled by the `selectorHandler()` function.
 * The most important checks are performed there.
 */
const trackInserterInlineSearchTerm = () => {
	// Pick up the search term from the `content` block attributes.
	const search_term = get(
		select( 'core/block-editor' ).getSelectedBlock(),
		[ 'attributes', 'content' ],
		''
	).substr( 1 );

	if ( search_term.length < 3 ) {
		return;
	}

	const context = 'inserter_inline';

	tracksRecordEvent( 'wpcom_block_picker_search_term', {
		search_term,
		context,
	} );

	/*
	 * Check if there are results by looking for the popover autocomplete in the DOM
	 * which will only be present
	 * if there are blocks that match the search term.
	 * Also, there is only a single popover Slot
	 * and so only 1 popover can render at a time.
	 */
	const hasResults = !! document.querySelectorAll( '.components-autocomplete__popover' ).length;
	if ( hasResults ) {
		return;
	}

	tracksRecordEvent( 'wpcom_block_picker_no_results', {
		search_term,
		context,
	} );
};

/**
 * This function takes over of returning a valid
 * target element, which will used to bind the handler function
 * to record the events.
 * It looks if there is a selected block in the editor,
 * checks the block type, if it's the active element in the
 * document, etc.
 */
function selectorHandler() {
	const selectedBlock = select( 'core/block-editor' ).getSelectedBlock();

	// Skip If there isn't a selected block.
	if ( ! selectedBlock ) {
		return;
	}

	const { name, attributes } = selectedBlock;

	// Skip if it is not a core/paragraph block.
	if ( name !== 'core/paragraph' ) {
		return;
	}

	/*
	 * Skip if content doesn't start with the slash `/` (as this is the shortcut used to trigger the block inserter).
	 * Also, check if the block search term is a valid block name
	 * ie: only lowercase alphanumeric characters and dashes,
	 * and must begin with a letter.
	 */
	const { content } = attributes;
	if ( ! /^\/[a-z][a-z0-9-]+$/.test( content ) ) {
		return;
	}

	const blockDOMElement = document.getElementById( `block-${ selectedBlock.clientId }` );
	// Skip if there is not a Block DOM element.
	if ( ! blockDOMElement ) {
		return;
	}

	// Skip if the block Element is not the active one.
	if ( blockDOMElement !== document.activeElement ) {
		return;
	}

	const blockClassName = blockDOMElement.className;

	// Skip if the block is not marked as "selected" via a class attribute.
	if ( ! blockClassName || ! blockDOMElement.classList.contains( 'is-selected' ) ) {
		return;
	}

	return blockDOMElement;
}
/**
 * Return the event definition object to track `wpcom_block_picker_search_term`,
 * adding the context event property with the `inserter_inline` value.
 * It also tracks `wpcom_block_picker_no_results` if the search term doesn't return any results.
 *
 * @returns {{handler: Function, selector: string|Function, type: string}} event object definition.
 */
export default () => ( {
	selector: selectorHandler,
	type: 'keyup',
	handler: debounce( trackInserterInlineSearchTerm, 500 ),
} );
