/**
 * External dependencies
 */
import { select } from '@wordpress/data';

/**
 * Internal dependencies
 */
import tracksRecordEvent from './track-record-event';

// Used to store data between capture and bubble handlers.
let replaceData = {};
const clearReplaceData = () => {
	replaceData = {};
};

/**
 * Return the event definition object to track the capture flow `wpcom_block_editor_template_part_replace`.
 *
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export const wpcomTemplatePartReplaceCapture = () => ( {
	id: 'wpcom-block-editor-template-part-replace-capture',
	selector:
		'.wp-block-template-part__preview-dropdown-content .wp-block-template-part__selection-preview-item',
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
		'.wp-block-template-part__preview-dropdown-content .wp-block-template-part__selection-preview-item',
	type: 'click',
	handler: () => {
		const block = select( 'core/block-editor' ).getSelectedBlock();
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
	},
} );
