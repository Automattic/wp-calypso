import tracksRecordEvent from './track-record-event';

/**
 * Return the event definition object to track `wpcom_site_editor_exit_click`.
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export default () => ( {
	id: 'wpcom-site-editor-exit-click',
	// Gutenberg v14.8 changes the close button and related class structure. When
	// '.edit-site-layout__view-mode-toggle' is set to an anchor instead of a button, this serves as
	// the close button.
	selector:
		'.edit-site-navigation-panel .edit-site-navigation-panel__back-to-dashboard, .edit-site-layout__logo a.edit-site-layout__view-mode-toggle',
	type: 'click',
	handler: () => tracksRecordEvent( 'wpcom_site_editor_exit_click' ),
} );
