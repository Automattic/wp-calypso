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

const trackAutocompleteBlockTerm = () => {
	const search_term = get( select( 'core/block-editor' ).getSelectedBlock(), [
		'attributes',
		'content',
	] );

	if ( search_term.length < 3 ) {
		return;
	}

	const context = 'autocomplete_block';

	tracksRecordEvent( 'wpcom_block_picker_search_term', {
		search_term,
		context,
	} );

	// Check if there are results, inspecting the DOM Tree.
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
	 * Skip if content doesn't start with the slash `/`.
	 * Also, check if the block name can only contain
	 * lowercase alphanumeric characters and dashes,
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

	// Skip is the block is not selected through class attribute.
	if ( ! blockClassName || ! /is-selected/.test( blockClassName ) ) {
		return;
	}

	return blockDOMElement;
}
/**
 * Return the event definition object to track `wpcom_block_picker_search_term`,
 * adding the context event property with the `autocompleter` value.
 * Also, it tracks `wpcom_block_picker_no_results` is the searcher doesn't return any result.
 *
 * @returns {{handler: Function, selector: string|Function, type: string}} event object definition.
 */
export default () => ( {
	selector: selectorHandler,
	type: 'keyup',
	handler: debounce( trackAutocompleteBlockTerm, 500 ),
} );
