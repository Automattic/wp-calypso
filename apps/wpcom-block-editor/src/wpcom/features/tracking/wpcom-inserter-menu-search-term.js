/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import { debounce } from 'lodash';

/**
 * WordPress dependencies
 */
import { useSelect, useDispatch } from '@wordpress/data';
import { __experimentalInserterMenuExtension as InserterMenuExtension } from '@wordpress/block-editor';
/* eslint-enable import/no-extraneous-dependencies */

const InserterMenuTrackingEvent = function () {
	const context = 'inserter_menu';

	const { selectedBlock, getSearchTerm } = useSelect( ( select ) => ( {
		selectedBlock: select( 'core/block-editor' ).getSelectedBlock(),
		getSearchTerm: select( 'automattic/tracking' ).getSearchTerm,
	} ) );

	// Search dispatchers.
	const { setSearchBlocksTerm, setSearchBlocks, setSearchBlocksNotFound } = useDispatch(
		'automattic/tracking'
	);

	const debouncedSetFilterValue = debounce( ( search_term, has_items ) => {
		setSearchBlocksTerm( { value: search_term, context } );

		if ( search_term.length < 3 ) {
			return;
		}

		const eventProperties = {
			search_term,
			context,
			selected_block: selectedBlock ? selectedBlock.name : null,
		};

		setSearchBlocks( eventProperties );

		if ( has_items ) {
			return;
		}

		setSearchBlocksNotFound( { context } );
	}, 500 );

	return (
		<InserterMenuExtension>
			{ ( { filterValue, hasItems } ) => {
				if ( getSearchTerm( context ) !== filterValue ) {
					debouncedSetFilterValue( filterValue, hasItems );
				}

				return null;
			} }
		</InserterMenuExtension>
	);
};

export default InserterMenuTrackingEvent;
