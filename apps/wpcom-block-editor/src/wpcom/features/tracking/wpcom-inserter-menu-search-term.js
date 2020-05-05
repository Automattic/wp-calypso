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

		/*
		 * Let's delegate registering no-results search event
		 * to the temporary solution below if the core version
		 * is equal to 7.8.1.
		 */
		if ( ! pluginVersion || ( pluginVersion && pluginVersion === '7.8.1' ) ) {
			return null;
		}

		// let's remove this line once the core version updates.
		debug( '%s version: tracking with Slot parameter', pluginVersion );

		if ( has_items ) {
			return;
		}

		tracksRecordEvent( 'wpcom_block_picker_no_results', eventProperties );
	}, 500 );

	/*
	 * Hacky temporal solution to detect no-results search result.
	 * Unfortunately, __experimentalInserterMenuExtension has a bug
	 * in the 7.8.1 core version.
	 * The `hasItems` property is always true so it isn't possible
	 * to rely on this value.
	 *
	 * @TODO: The following is a temporary solution and it should be removed
	 *   and replaced by the usage of the `hasItems` property,
	 *   once a new version of core is available in dotcom.
	 */
	useEffect( () => {
		// Skip whether isn't the 7.8.1 version.
		if ( pluginVersion && pluginVersion !== '7.8.1' ) {
			return;
		}
		// let's remove this line once the core version updates.
		debug( '%s: tracking inspecting DOM tree', ( pluginVersion || 'unknown' ) + ' version' );

		if ( ! searchTerm || searchTerm.length < 3 ) {
			return;
		}

		const eventProperties = {
			search_term: searchTerm,
			context: 'inserter_menu',
			selected_block: selectedBlock ? selectedBlock.name : null,
		};

		const hasResultsEl = document.querySelectorAll( '.block-editor-inserter__results' );
		const hasNoResultsEl =
			document.querySelectorAll( '.block-editor-inserter__no-results' ).length !== 0;

		if (
			hasNoResultsEl ||
			( hasResultsEl && hasResultsEl[ 0 ] && hasResultsEl[ 0 ].children.length === 0 )
		) {
			tracksRecordEvent( 'wpcom_block_picker_no_results', eventProperties );
		}
	}, [ searchTerm, pluginVersion, selectedBlock ] );

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
