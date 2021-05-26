/**
 * Internal dependencies
 */
import tracksRecordEvent from './track-record-event';
import { getIsEditingCustomPostTemplate } from '../utils';

/**
 * Return the event definition object to track `wpcom_block_editor_custom_post_template_save`.
 *
 * @returns {{handler: Function, selector: string, type: string}} event object definition.
 */
export default () => ( {
	selector: '.entities-saved-states__panel .editor-entities-saved-states__save-button',
	type: 'click',
	handler: () => {
		if ( ! getIsEditingCustomPostTemplate() ) {
			return;
		}

		tracksRecordEvent( 'wpcom_block_editor_custom_post_template_save' );
	},
} );
