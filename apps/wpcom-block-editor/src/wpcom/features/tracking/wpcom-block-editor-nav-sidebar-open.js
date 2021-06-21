/**
 * Internal dependencies
 */
import tracksRecordEvent from './track-record-event';

/**
 * Return the event definition object to track `wpcom_block_editor_nav_sidebar_open`.
 *
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export default () => ( {
	id: 'wpcom-block-editor-nav-sidebar-open',
	selector:
		'.edit-post-header .wpcom-block-editor-nav-sidebar-toggle-sidebar-button__button[aria-expanded="false"]',
	type: 'click',
	capture: true,
	handler: () => tracksRecordEvent( 'wpcom_block_editor_nav_sidebar_open' ),
} );
