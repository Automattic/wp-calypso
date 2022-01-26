import { select } from '@wordpress/data';
import tracksRecordEvent from './track-record-event';

/**
 * Return the event definition object to track `wpcom_block_editor_save_click`.
 *
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export const wpcomBlockEditorSaveClick = () => ( {
	id: 'wpcom-block-editor-save-click',
	// The first selector is for site editing. The second is for post editing.
	selector:
		'.editor-entities-saved-states__save-button, .editor-post-publish-button:not(.has-changes-dot)',
	type: 'click',
	handler: () => {
		const isCurrentPostPublished = select( 'core/editor' ).isCurrentPostPublished();
		const isCurrentPostScheduled = select( 'core/editor' ).isCurrentPostScheduled();
		let actionType;

		if ( isCurrentPostPublished || isCurrentPostScheduled ) {
			actionType = 'update';
		} else {
			actionType = 'publish';
		}

		tracksRecordEvent( 'wpcom_block_editor_save_click', {
			action_type: actionType,
		} );
	},
} );

export const wpcomBlockEditorSaveDraftClick = () => ( {
	id: 'wpcom-block-editor-save-click',
	selector: '.editor-post-save-draft',
	type: 'click',
	capture: true,
	handler: () => {
		tracksRecordEvent( 'wpcom_block_editor_save_click', {
			action_type: 'save_draft',
		} );
	},
} );
