/**
 * Internal dependencies
 */
import tracksRecordEvent from './track-record-event';

const TRACKABLE_TAG_NAMES = [ 'BUTTON', 'SELECT' ];

/**
 * Return the event definition object to track `wpcom_block_editor_custom_post_template_save`.
 *
 * @returns {{handler: Function, selector: string, type: string}} event object definition.
 */
export default () => ( {
	selector: '.edit-post-sidebar .components-panel__body',
	type: 'click',
	handler: ( event ) => {
		if ( TRACKABLE_TAG_NAMES.includes( event.target.tagName ) ) {
			tracksRecordEvent( 'wpcom_block_editor_custom_post_template_actions_click' );
		}
	},
} );
