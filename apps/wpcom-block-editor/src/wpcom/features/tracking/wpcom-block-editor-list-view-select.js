import { select } from '@wordpress/data';
import tracksRecordEvent from './track-record-event';

/**
 * Return the event definition object to track `wpcom_block_editor_list_view_select`.
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export default () => ( {
	id: 'wpcom-block-editor-list-view-select',
	selector: '[aria-label="Block navigation structure"] [role="row"]:not(.is-selected) a',
	type: 'click',
	capture: true,
	handler: async () => {
		const { getSelectedBlock } = select( 'core/block-editor' );

		const blockBefore = getSelectedBlock();
		// Wait until the selected block changes.
		while ( blockBefore?.clientId === getSelectedBlock()?.clientId ) {
			await new Promise( ( resolve ) => setTimeout( resolve, 10 ) );
		}

		const currentBlock = getSelectedBlock();
		tracksRecordEvent( 'wpcom_block_editor_list_view_select', {
			block_name: currentBlock.name,
		} );
	},
} );
