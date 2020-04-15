/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import { debounce } from 'lodash';

/**
 * WordPress dependencies
 */
import { useState } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { __experimentalInserterMenuExtension as InserterMenuExtension } from '@wordpress/block-editor';

/* eslint-enable import/no-extraneous-dependencies */

/**
 * Internal dependencies
 */
import tracksRecordEvent from './track-record-event';

const InserterMenuTrackingEvent = function() {
	const [ searchTerm, setSearchTerm ] = useState( '' );
	const { selectedBlock } = useSelect( select => ( {
		selectedBlock: select( 'core/block-editor' ).getSelectedBlock(),
	} ) );

	const debouncedSetFilterValue = debounce( search_term => {
		setSearchTerm( search_term );

		if ( search_term.length < 3 ) {
			return;
		}

		const eventProperties = { search_term, context: 'inserter_menu' };

		/*
		 * Populate event properties with `selected_block`
		 * if there is a selected block in the editor.
		 */
		if ( selectedBlock ) {
			eventProperties.selected_block = selectedBlock.name;
		}

		tracksRecordEvent( 'wpcom_block_picker_search_term', { ...eventProperties } );
	}, 500 );

	return (
		<InserterMenuExtension>
			{ ( { filterValue } ) => {
				if ( searchTerm !== filterValue ) {
					debouncedSetFilterValue( filterValue );
				}

				return null;
			} }
		</InserterMenuExtension>
	);
};

export default InserterMenuTrackingEvent;
