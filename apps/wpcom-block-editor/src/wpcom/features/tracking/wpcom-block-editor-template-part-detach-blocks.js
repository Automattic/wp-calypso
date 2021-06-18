/**
 * External dependencies
 */
import { select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import tracksRecordEvent from './track-record-event';

/**
 * Return the event definition object to track `wpcom_block_editor_template_part_detach_blocks`.
 *
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export default () => ( {
	id: 'wpcom-block-editor-template-part-detach-blocks',
	selector: '.components-menu-item__button',
	type: 'click',
	capture: true,
	handler: ( _event, target ) => {
		const item = target.querySelector( '.components-menu-item__item' );
		if ( item?.innerText === __( 'Detach blocks from template part' ) ) {
			const block = select( 'core/block-editor' ).getSelectedBlock();
			const templatePartId = `${ block.attributes.theme }//${ block.attributes.slug }`;
			const templatePart = select( 'core' ).getEditedEntityRecord(
				'postType',
				'wp_template_part',
				templatePartId
			);
			tracksRecordEvent( 'wpcom_block_editor_template_part_detach_blocks', {
				variation_slug: templatePart.area,
			} );
		}
	},
} );
