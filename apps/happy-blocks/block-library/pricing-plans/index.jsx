import {
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
} from '@automattic/calypso-products';
import { registerBlockType } from '@wordpress/blocks';
import { __ } from '@wordpress/i18n';
import config from './config';
import { Edit } from './edit';

const blockAttributes = {
	defaultProductSlug: {
		enum: config.plans,
	},
	productSlug: {
		enum: config.plans,
	},
	domain: {
		type: 'string',
	},
	planTypeOptions: {
		type: 'array',
		default: [],
	},
};

function registerBlocks() {
	registerBlockType( 'happy-blocks/pricing-plans', {
		title: __( 'Upgrade Pricing Plan', 'happy-blocks' ),
		icon: 'money-alt',
		category: 'embed',
		description: __( 'Pricing Plan upgrade block', 'happy-blocks' ),
		keywords: [
			__( 'pricing', 'happy-blocks' ),
			__( 'plans', 'happy-blocks' ),
			__( 'upgrade', 'happy-blocks' ),
		],
		attributes: blockAttributes,
		edit: Edit,
		variations: [
			{
				isDefault: true,
				name: 'personal',
				title: __( 'Upgrade Personal', 'happy-blocks' ),
				description: __( 'Upgrade to Personal pricing plan', 'happy-blocks' ),
				attributes: {
					defaultProductSlug: PLAN_PERSONAL,
				},
			},
			{
				name: 'premium',
				title: __( 'Upgrade Premium', 'happy-blocks' ),
				description: __( 'Upgrade to Premium pricing plan', 'happy-blocks' ),
				attributes: {
					defaultProductSlug: PLAN_PREMIUM,
				},
			},
			{
				name: 'business',
				title: __( 'Upgrade Business', 'happy-blocks' ),
				description: __( 'Upgrade to Business pricing plan', 'happy-blocks' ),
				attributes: {
					defaultProductSlug: PLAN_BUSINESS,
				},
			},
			{
				name: 'ecommerce',
				title: __( 'Upgrade Commerce', 'happy-blocks' ),
				description: __( 'Upgrade to Commerce pricing plan', 'happy-blocks' ),
				attributes: {
					defaultProductSlug: PLAN_ECOMMERCE,
				},
			},
		],
	} );
}

registerBlocks();
