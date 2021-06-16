/**
 * Internal dependencies
 */
import tracksRecordEvent from './track-record-event';

const getTabNameFromId = ( id ) => ( id?.endsWith?.( '-block' ) ? 'block-type' : 'root' );

export function trackGlobalStylesTabSelected( { tab, open } = {} ) {
	const activeTabElement = document.querySelector(
		'.edit-site-global-styles-sidebar .components-tab-panel__tabs button.is-active'
	);
	const activeTabName = tab || getTabNameFromId( activeTabElement.id );
	const isSidebarOpen =
		typeof open !== 'undefined'
			? open
			: !! document.querySelector( '.edit-site-global-styles-sidebar' );

	tracksRecordEvent( 'wpcom_block_editor_global_styles_tab_selected', {
		tab: activeTabName,
		open: isSidebarOpen,
	} );
}

/**
 * Return the event definition object to track `wpcom_block_editor_global_styles_tab_selected`.
 *
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export default () => ( {
	selector: `.edit-site-global-styles-sidebar .components-tab-panel__tabs button:not(.is-active)`,
	type: 'click',
	capture: true,
	handler: ( event ) =>
		trackGlobalStylesTabSelected( {
			tab: getTabNameFromId( event.target.id ),
		} ),
} );
