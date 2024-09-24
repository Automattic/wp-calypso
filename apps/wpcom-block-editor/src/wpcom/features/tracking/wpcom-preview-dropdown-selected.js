import { __ } from '@wordpress/i18n';
import tracksRecordEvent from './track-record-event';

/**
 * Return the event definition object to track `wpcom_block_editor_template_part_detach_blocks`.
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export default () => ( {
	id: 'wpcom-preview-dropdown-selected',
	selector: [
		'.components-menu-item__button',
		// The “Preview in new tab” item in the post/page editor
		'.editor-preview-dropdown__button-external',
	]
		.map(
			( className ) =>
				`.components-dropdown-menu__menu[aria-label="${ __( 'View options' ) }"] ${ className }`
		)
		.join( ',' ),
	type: 'click',
	capture: true,
	handler: ( _event, target ) => {
		const mapTextToPreviewMode = {
			[ __( 'Desktop' ) ]: 'desktop',
			[ __( 'Desktop (50%)' ) ]: 'zoom-out',
			[ __( 'Tablet' ) ]: 'tablet',
			[ __( 'Mobile' ) ]: 'mobile',
			[ [ __( 'View site' ), __( '(opens in a new tab)' ) ].join( '\n' ) ]: 'view-site',
			[ __( 'Preview in new tab' ) ]: 'preview',
		};

		const previewMode = mapTextToPreviewMode[ target.innerText ];
		if ( previewMode ) {
			tracksRecordEvent( 'wpcom_editor_preview_dropdown_selected', {
				preview_mode: previewMode,
			} );
		}
	},
} );
