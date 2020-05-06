/* eslint-disable import/no-extraneous-dependencies */
/**
 * External dependencies
 */
import { debounce } from 'lodash';
import debugFactory from 'debug';

/**
 * WordPress dependencies
 */
import { useState, useEffect } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { __experimentalInserterMenuExtension as InserterMenuExtension } from '@wordpress/block-editor';

/* eslint-enable import/no-extraneous-dependencies */

/**
 * Internal dependencies
 */
import tracksRecordEvent from './track-record-event';

// let's remove this line once the core version updates.
const debug = debugFactory( 'wpcom-block-editor:tracking:inserter-menu' );

const InserterMenuTrackingEvent = function () {
	const [ searchTerm, setSearchTerm ] = useState( '' );
	const { selectedBlock } = useSelect( ( select ) => ( {
		selectedBlock: select( 'core/block-editor' ).getSelectedBlock(),
	} ) );

	const pluginVersion = window.wpcomGutenberg ? window.wpcomGutenberg.pluginVersion : null;

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
