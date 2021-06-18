/**
 * Internal dependencies
 */
import tracksRecordEvent from './track-record-event';

/**
 * Return the event definition object to track `wpcom_block_editor_details_click`.
 *
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export default () => ( {
	id: 'wpcom-block-editor-details-click',
	selector: '.edit-post-header .table-of-contents button[aria-disabled="false"]',
	type: 'click',
	handler: () => tracksRecordEvent( 'wpcom_block_editor_details_click' ),
} );
