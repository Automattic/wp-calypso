import {
	__unstableInserterMenuExtension,
	// eslint-disable-next-line import/named
	__experimentalInserterMenuExtension,
} from '@wordpress/block-editor';
import { useSelect } from '@wordpress/data';
import { useState } from '@wordpress/element';
import { debounce } from 'lodash';
import tracksRecordEvent from './track-record-event';

// InserterMenuExtension has been made unstable in this PR: https://github.com/WordPress/gutenberg/pull/31417 / Gutenberg v10.7.0-rc.1.
// We need to support both symbols until we're sure Gutenberg < v10.7.x is not used anymore in WPCOM.
const InserterMenuExtension =
	typeof __unstableInserterMenuExtension !== 'undefined'
		? __unstableInserterMenuExtension
		: __experimentalInserterMenuExtension;

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

	const debouncedSetFilterValueDirectory = debounce( ( search_term ) => {
		if ( search_term.length < 3 ) {
			return;
		}

		// This is to avoid record an event on sites with a Free plan
		if (
			document.querySelectorAll( '.block-directory-downloadable-blocks-panel' ).length < 1 &&
			document.querySelectorAll( '.block-editor-inserter__tips' ).length < 1
		) {
			return;
		}

		const trackEventName = document.querySelectorAll(
			'.block-directory-downloadable-block-list-item'
		).length
			? 'wpcom_block_directory_has_results'
			: 'wpcom_block_directory_no_results';

		tracksRecordEvent( trackEventName, {
			search_term,
		} );
	}, 2000 );

	return (
		<InserterMenuExtension>
			{ ( { filterValue, hasItems } ) => {
				if ( searchTerm !== filterValue ) {
					debouncedSetFilterValue( filterValue, hasItems );
					debouncedSetFilterValueDirectory( filterValue, hasItems );
				}

				return null;
			} }
		</InserterMenuExtension>
	);
};

export default InserterMenuTrackingEvent;
