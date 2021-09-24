import { __ } from '@wordpress/i18n';
import tracksRecordEvent from './track-record-event';

function trackGlobalStylesMenuSelected( { path } ) {
	const isAtTopLevel = document.querySelector(
		'.edit-site-global-styles-sidebar .edit-site-global-styles-preview'
	);

	if ( ! isAtTopLevel ) {
		return;
	}

	const buttonText = path.find( ( node ) => node.nodeName === 'BUTTON' )?.innerText;

	if ( buttonText === __( 'Typography' ) ) {
		tracksRecordEvent( 'wpcom_block_editor_global_styles_menu_selected', {
			menu: 'typography',
		} );
	} else if ( buttonText === __( 'Colors' ) ) {
		tracksRecordEvent( 'wpcom_block_editor_global_styles_menu_selected', {
			menu: 'colors',
		} );
	} else if ( buttonText === __( 'Blocks' ) ) {
		tracksRecordEvent( 'wpcom_block_editor_global_styles_menu_selected', {
			menu: 'blocks',
		} );
	} else if ( buttonText === __( 'Layout' ) ) {
		tracksRecordEvent( 'wpcom_block_editor_global_styles_menu_selected', {
			menu: 'layout',
		} );
	}
}

/**
 * Return the event definition object to track `wpcom_block_editor_global_styles_menu_selected`.
 *
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export default () => ( {
	id: 'wpcom-block-editor-global-styles-menu-selected',
	selector: `.edit-site-global-styles-sidebar .components-panel button`,
	type: 'click',
	// Using capture event listener to make sure the evaluation happens before the menu changes to
	// the selected level.
	capture: true,
	handler: trackGlobalStylesMenuSelected,
} );
