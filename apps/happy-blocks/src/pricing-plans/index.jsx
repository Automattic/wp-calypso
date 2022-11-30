import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import config from './config';
import { EditBusiness, EditEcommerce, EditPersonal, EditPremium } from './edit';

const blockAttributes = {
	productSlug: {
		enum: config.plans,
	},
	domain: {
		type: 'string',
	},
};

function registerBlocks() {
	registerBlockType( 'happy-blocks/pricing-plans-personal', {
		apiVersion: 2,
		title: __( 'Upgrade Personal', 'happy-blocks' ),
		icon: 'money-alt',
		category: 'embed',
		description: __( 'Personal pricing plan upgrade', 'happy-blocks' ),
		keywords: [
			__( 'pricing', 'happy-blocks' ),
			__( 'plans', 'happy-blocks' ),
			__( 'upgrade', 'happy-blocks' ),
		],
		attributes: blockAttributes,
		edit: EditPersonal,
	} );

	registerBlockType( 'happy-blocks/pricing-plans-premium', {
		apiVersion: 2,
		title: __( 'Upgrade Premium', 'happy-blocks' ),
		icon: 'money-alt',
		category: 'embed',
		description: __( 'Premium pricing plan upgrade', 'happy-blocks' ),
		keywords: [
			__( 'pricing', 'happy-blocks' ),
			__( 'plans', 'happy-blocks' ),
			__( 'upgrade', 'happy-blocks' ),
		],
		attributes: blockAttributes,
		edit: EditPremium,
	} );

	registerBlockType( 'happy-blocks/pricing-plans-business', {
		apiVersion: 2,
		title: __( 'Upgrade Business', 'happy-blocks' ),
		icon: 'money-alt',
		category: 'embed',
		description: __( 'Business pricing plan upgrade', 'happy-blocks' ),
		keywords: [
			__( 'pricing', 'happy-blocks' ),
			__( 'plans', 'happy-blocks' ),
			__( 'upgrade', 'happy-blocks' ),
		],
		attributes: blockAttributes,
		edit: EditBusiness,
	} );

	registerBlockType( 'happy-blocks/pricing-plans-ecommerce', {
		apiVersion: 2,
		title: __( 'Upgrade eCommerce', 'happy-blocks' ),
		icon: 'money-alt',
		category: 'embed',
		description: __( 'eCommerce pricing plan upgrade', 'happy-blocks' ),
		keywords: [
			__( 'pricing', 'happy-blocks' ),
			__( 'plans', 'happy-blocks' ),
			__( 'upgrade', 'happy-blocks' ),
		],
		attributes: blockAttributes,
		edit: EditEcommerce,
	} );
}

registerBlocks();
