import tracksRecordEvent from './track-record-event';

/**
 * Return the event definition object to track `wpcom_block_editor_details_open`.
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export default () => ( {
	id: 'wpcom-block-editor-details-open',
	selector:
		'.edit-post-header .table-of-contents button[aria-disabled="false"][aria-expanded="false"]',
	type: 'click',
	// We need to run this event listener before the button's aria-expanded
	// attribute is changed. This makes sure we only track opens.
	capture: true,
	handler: () => tracksRecordEvent( 'wpcom_block_editor_details_open' ),
} );
