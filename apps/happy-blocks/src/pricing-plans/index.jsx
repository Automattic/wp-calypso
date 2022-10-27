import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { Edit } from './edit';
import { Save } from './save';

const blockAttributes = {};

export function registerBlock() {
	registerBlockType( 'happy-blocks/pricing-plans', {
		title: __( 'Pricing plans' ),
		icon: 'leftright',
		category: 'a8c',
		description: __( 'List of available pricing plans' ),
		keywords: [ __( 'pricing' ), __( 'plans' ), __( 'upgrade' ) ],
		attributes: blockAttributes,
		edit: Edit,
		save: Save,
	} );
}

registerBlock();
