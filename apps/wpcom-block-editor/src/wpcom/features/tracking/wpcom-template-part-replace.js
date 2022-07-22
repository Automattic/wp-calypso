import { select } from '@wordpress/data';
import tracksRecordEvent from './track-record-event';

// Used to store data between capture and bubble handlers.
let replaceData = {};
const clearReplaceData = () => {
	replaceData = {};
};

/**
 * Return the event definition object to track the capture flow `wpcom_block_editor_template_part_replace`.
 * This runs just a bit earlier to the bubble handler event, and allows us to
 * capture information about the block before changes are made, in this case the replaceData.
 *
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export const wpcomTemplatePartReplaceCapture = () => ( {
	id: 'wpcom-block-editor-template-part-replace-capture',
	selector:
		'.block-library-template-part__selection-content .block-editor-block-patterns-list__item',
	type: 'click',
	capture: true,
	handler: () => {
		clearReplaceData();
		const block = select( 'core/block-editor' ).getSelectedBlock();
		const templatePartId = `${ block.attributes.theme }//${ block.attributes.slug }`;
		const templatePart = select( 'core' ).getEditedEntityRecord(
			'postType',
			'wp_template_part',
			templatePartId
		);
		replaceData.replaced_variation_slug = templatePart.area;
		replaceData.replaced_template_part_id = templatePartId;
	},
} );

/**
 * Return the event definition object to track `wpcom_block_editor_template_part_replace`.
 *
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export const wpcomTemplatePartReplaceBubble = () => ( {
	id: 'wpcom-block-editor-template-part-replace-bubble',
	selector:
		'.block-library-template-part__selection-content .block-editor-block-patterns-list__item',
	type: 'click',
	handler: () => {
		const block = select( 'core/block-editor' ).getSelectedBlock();

		// If we're replacing (vs adding), replaceData.replaced_variation_slug will be defined.
		if ( replaceData.replaced_variation_slug ) {
			const templatePartId = `${ block.attributes.theme }//${ block.attributes.slug }`;
			const templatePart = select( 'core' ).getEditedEntityRecord(
				'postType',
				'wp_template_part',
				templatePartId
			);
			tracksRecordEvent( 'wpcom_block_editor_template_part_replace', {
				variation_slug: templatePart.area,
				template_part_id: templatePartId,
				...replaceData,
			} );
			clearReplaceData();
		}
	},
} );
