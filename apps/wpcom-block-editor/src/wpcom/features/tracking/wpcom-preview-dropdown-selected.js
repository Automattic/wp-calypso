import { __ } from '@wordpress/i18n';
import tracksRecordEvent from './track-record-event';

/**
 * Return the event definition object to track `wpcom_block_editor_template_part_detach_blocks`.
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export default () => ( {
	id: 'wpcom-preview-dropdown-selected',
	selector: '.components-menu-item__button',
	type: 'click',
	capture: true,
	handler: ( _event, target ) => {
		const mapTextToPreviewMode = {
			[ __( 'Desktop' ) ]: 'desktop',
			[ __( 'Desktop (50%)' ) ]: 'zoom-out',
			[ __( 'Tablet' ) ]: 'tablet',
			[ __( 'Mobile' ) ]: 'mobile',
			[ `${ __( 'View site' ) }\n${ __( '(opens in a new tab)' ) }` ]: 'view-site',
			[ __( 'Preview in new tab' ) ]: 'preview',
		};

		const item = target.querySelector( '.components-menu-item__item' );
		const previewMode = mapTextToPreviewMode[ item?.innerText ];
		if ( previewMode ) {
			tracksRecordEvent( 'wpcom_editor_preview_dropdown_selected', {
				preview_mode: previewMode,
			} );
		}
	},
} );
