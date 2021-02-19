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

/**
 * Internal dependencies
 */
import tracksRecordEvent from './track-record-event';

const InserterMenuTrackingEvent = function () {
	const [ searchTerm, setSearchTerm ] = useState( '' );
	const { selectedBlock } = useSelect( ( select ) => ( {
		selectedBlock: select( 'core/block-editor' ).getSelectedBlock(),
	} ) );

	const debouncedSetFilterValue = debounce( ( search_term, has_items ) => {
		setSearchTerm( search_term );

		if ( search_term.length < 3 ) {
			return;
		}

		const eventProperties = {
			search_term,
			context: 'inserter_menu',
			selected_block: selectedBlock ? selectedBlock.name : null,
		};

		tracksRecordEvent( 'wpcom_block_picker_search_term', eventProperties );

		if ( has_items ) {
			return;
		}

		tracksRecordEvent( 'wpcom_block_picker_no_results', eventProperties );
	}, 500 );

	return (
		<InserterMenuExtension>
			{ ( { filterValue, hasItems } ) => {
				if ( searchTerm !== filterValue ) {
					debouncedSetFilterValue( filterValue, hasItems );
				}

				return null;
			} }
		</InserterMenuExtension>
	);
};

export default InserterMenuTrackingEvent;
