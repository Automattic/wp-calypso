/**
 * Internal dependencies
 */
import tracksRecordEvent from './track-record-event';

/**
 * Return the event definition object to track `wpcom_block_editor_list_view_click`.
 *
 * @returns {{handler: Function, selector: string, type: string}} event object definition.
 */
export default () => ( {
	selector:
		'.edit-post-header .edit-post-header-toolbar__list-view-toggle, .edit-site-header .edit-site-header-toolbar__list-view-toggle',
	type: 'click',
	handler: () => tracksRecordEvent( 'wpcom_block_editor_list_view_click' ),
} );
