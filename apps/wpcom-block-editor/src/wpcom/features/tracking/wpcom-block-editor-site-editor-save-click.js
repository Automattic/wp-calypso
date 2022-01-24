import { getEditorType } from '../utils';
import tracksRecordEvent from './track-record-event';

/**
 * Return the event definition object to track `wpcom_block_editor_site_editor_save_click`.
 *
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export default () => ( {
	id: 'wpcom-block-editor-site-editor-save-click',
	selector: '.editor-entities-saved-states__save-button',
	type: 'click',
	handler: () => {
		if ( getEditorType() === 'site' ) {
			tracksRecordEvent( 'wpcom_block_editor_site_editor_save_click' );
		}
	},
} );
