/**
 * Internal dependencies
 */
import tracksRecordEvent from './track-record-event';

/**
 * Return the event definition object to track `calypso_editor_sidebar_editor_close` in the Site Editor.
 *
 * @returns {{handler: Function, selector: string, type: string}} event object definition.
 */
export default () => ( {
	selector: '.edit-site-navigation-panel__back-to-dashboard',
	type: 'click',
	handler: () => tracksRecordEvent( 'calypso_editor_sidebar_editor_close' ),
} );
