import { select } from '@wordpress/data';
import tracksRecordEvent from './track-record-event';

/**
 * Return the event definition object to track `wpcom_block_editor_save_click`.
 *
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export const wpcomBlockEditorSaveClick = () => ( {
	id: 'wpcom-block-editor-save-click',
	selector:
		'.editor-entities-saved-states__save-button, .editor-post-publish-button:not(.has-changes-dot)',
	type: 'click',
	handler: () => {
		const isSiteEditor = Boolean( select( 'core/edit-site' ) );
		const isCurrentPostPublished = select( 'core/editor' ).isCurrentPostPublished();
		const isEditedPostBeingScheduled = select( 'core/editor' ).isEditedPostBeingScheduled();
		let actionType = 'publishing';

		if ( isSiteEditor ) {
			actionType = 'saving';
		} else if ( isEditedPostBeingScheduled ) {
			actionType = 'scheduling';
		} else if ( isCurrentPostPublished ) {
			actionType = 'updating';
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
