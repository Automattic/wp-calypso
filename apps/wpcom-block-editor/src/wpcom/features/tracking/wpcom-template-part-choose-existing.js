/**
 * External dependencies
 */
import { select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import tracksRecordEvent from './track-record-event';

/**
 * Return the event definition object to track `wpcom_block_editor_template_part_choose_existing`.
 *
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export default () => ( {
	id: 'wpcom-block-editor-template-part-choose-existing',
	selector:
		'.wp-block-template-part__placeholder-preview-dropdown-content .wp-block-template-part__selection-preview-item',
	type: 'click',
	handler: () => {
		const block = select( 'core/block-editor' ).getSelectedBlock();
		const templatePartId = `${ block.attributes.theme }//${ block.attributes.slug }`;
		const templatePart = select( 'core' ).getEditedEntityRecord(
			'postType',
			'wp_template_part',
			templatePartId
		);
		tracksRecordEvent( 'wpcom_block_editor_template_part_choose_existing', {
			variation_slug: templatePart?.area,
			template_part_id: templatePartId,
		} );
	},
} );
