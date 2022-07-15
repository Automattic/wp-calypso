import tracksRecordEvent from './track-record-event';

/**
 * Return the event definition object to track `wpcom_site_editor_exit_click`.
 *
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export default () => ( {
	id: 'wpcom-site-editor-exit-click',
	selector: '.edit-site-navigation-panel .edit-site-navigation-panel__back-to-dashboard',
	type: 'click',
	handler: () => tracksRecordEvent( 'wpcom_site_editor_exit_click' ),
} );
