import { select } from '@wordpress/data';
import { __ } from '@wordpress/i18n';
import { getFlattenedBlockNames } from '../utils';
import tracksRecordEvent from './track-record-event';

/**
 * Return the event definition object to track `wpcom_block_editor_template_part_detach_blocks`.
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
			// We fire the event with and without the block names. We do this to
			// make sure the event is tracked all the time. The block names
			// might become a string that's too long and as a result it will
			// fail because of URL length browser limitations.
			tracksRecordEvent( 'wpcom_block_editor_template_part_detach_blocks', {
				template_part_id: templatePartId,
				variation_slug: templatePart.area,
			} );
			tracksRecordEvent( 'wpcom_block_editor_template_part_detach_blocks', {
				template_part_id: templatePartId,
				variation_slug: templatePart.area,
				block_names: getFlattenedBlockNames( templatePart.blocks ).join( ',' ),
			} );
		}
	},
} );
