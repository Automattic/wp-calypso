/**
 * External dependencies
 */
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import tracksRecordEvent from './track-record-event';

/**
 * Return the event definition object to track `wpcom_block_editor_template_part_detach_blocks`.
 *
 * @returns {{handler: Function, selector: string, type: string}} event object definition.
 */
export default () => ( {
	selector: '.components-menu-item__button',
	type: 'click',
	handler: ( _event, target ) => {
		const item = target.querySelector( '.components-menu-item__item' );
		if ( item?.innerText === __( 'Detach blocks from template part' ) ) {
			tracksRecordEvent( 'wpcom_block_editor_template_part_detach_blocks' );
		}
	},
} );
