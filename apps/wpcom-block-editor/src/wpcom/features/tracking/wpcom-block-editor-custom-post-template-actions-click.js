/**
 * Internal dependencies
 */
import tracksRecordEvent from './track-record-event';

/**
 * Return the event definition object to track `wpcom_block_editor_custom_post_template_save`.
 *
 * @returns {{handler: Function, selector: string, type: string}} event object definition.
 */
export default () => ( {
	selector: '.edit-post-sidebar .edit-post-template__actions',
	type: 'click',
	handler: () => tracksRecordEvent( 'wpcom_block_editor_custom_post_template_actions_click' ),
} );
