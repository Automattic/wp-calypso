import tracksRecordEvent from './track-record-event';

/**
 * Return the event definition object to track `wpcom_block_editor_save_click`.
 *
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export default () => ( {
	id: 'wpcom-block-editor-save-click',
	// The first selector is for site editing. The second is for post editing.
	selector: '.editor-entities-saved-states__save-button, .editor-post-publish-button:not(.has-changes-dot), .editor-post-save-draft',
	type: 'click',
	handler: () => {
		tracksRecordEvent( 'wpcom_block_editor_save_click' );
	},
} );
