import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import { Edit } from './edit';
import { Save } from './save';

const blockAttributes = {};

export function registerBlock() {
	registerBlockType( 'happy-blocks/pricing-plans', {
		title: __( 'Pricing plans', 'happy-blocks' ),
		icon: 'leftright',
		category: 'a8c',
		description: __( 'List of available pricing plans', 'happy-blocks' ),
		keywords: [
			__( 'pricing', 'happy-blocks' ),
			__( 'plans', 'happy-blocks' ),
			__( 'upgrade', 'happy-blocks' ),
		],
		attributes: blockAttributes,
		edit: Edit,
		save: Save,
	} );
}

registerBlock();
