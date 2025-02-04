import tracksRecordEvent from './track-record-event';

/**
 * Return the event definition object to track `wpcom_block_editor_close_click`.
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export default () => ( {
	id: 'wpcom-block-editor-close-click',
	selector: '.edit-post-header .edit-post-fullscreen-mode-close',
	type: 'click',
	handler: () => tracksRecordEvent( 'wpcom_block_editor_close_click' ),
} );
