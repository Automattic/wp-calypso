import { select } from '@wordpress/data';
import tracksRecordEvent from './track-record-event';

// Used to store data between capture and bubble handlers.
let replaceData = {};
const clearReplaceData = () => {
	replaceData = {};
};

/**
 * Return the event definition object to track capture flow.
 * This runs earlier than bubble handlers below, and captures
 * info, before changes, that is stored in replaceData and later
 * used to determine type of Tracks event to record.
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export const wpcomTemplatePartChooseCapture = () => ( {
	id: 'wpcom-block-editor-template-part-capture',
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
 * Return the event definition object to track
 * `wpcom_block_editor_template_part_choose_existing`.
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export const wpcomTemplatePartChooseBubble = () => ( {
	id: 'wpcom-block-editor-template-part-choose-existing',
	selector:
		'.block-library-template-part__selection-content .block-editor-block-patterns-list__item',
	type: 'click',
	handler: () => {
		// If replaced_variation_slug is not defined, we're inserting a new template part.
		if ( ! replaceData.replaced_variation_slug ) {
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

			clearReplaceData();
		}
	},
} );

/**
 * Return the event definition object to track
 * `wpcom_block_editor_template_part_replace`.
 * @returns {import('./types').DelegateEventHandler} event object definition.
 */
export const wpcomTemplatePartReplaceBubble = () => ( {
	id: 'wpcom-block-editor-template-part-replace-bubble',
	selector:
		'.block-library-template-part__selection-content .block-editor-block-patterns-list__item',
	type: 'click',
	handler: () => {
		// If replaced_variation_slug is defined, we're replacing a template part.
		if ( replaceData.replaced_variation_slug ) {
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
		}
	},
} );
