import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import config from './config';
import { Edit } from './edit';

const blockAttributes = {
	productSlug: {
		enum: config.plans,
	},
	domain: {
		type: 'string',
	},
};

function registerBlock() {
	registerBlockType( 'happy-blocks/pricing-plans', {
		apiVersion: 2,
		title: __( 'Upgrade', 'happy-blocks' ),
		icon: 'money-alt',
		category: 'embed',
		description: __( 'List of available pricing plans', 'happy-blocks' ),
		keywords: [
			__( 'pricing', 'happy-blocks' ),
			__( 'plans', 'happy-blocks' ),
			__( 'upgrade', 'happy-blocks' ),
		],
		attributes: blockAttributes,
		edit: Edit,
	} );
}

registerBlock();
