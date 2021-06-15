/**
 * Internal dependencies
 */
import tracksRecordEvent from './track-record-event';

/**
 * Return the event definition object to track `wpcom_block_editor_core_nav_sidebar_editor_close` in the Site Editor.
 *
 * @returns {{handler: Function, selector: string, type: string}} event object definition.
 */
export default () => ( {
	selector: '.edit-site-navigation-panel__back-to-dashboard',
	type: 'click',
	handler: () => tracksRecordEvent( 'wpcom_block_editor_core_nav_sidebar_editor_close' ),
} );
