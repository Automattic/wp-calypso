import {
	getPlan,
	PLAN_BUSINESS,
	PLAN_ECOMMERCE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
} from '@automattic/calypso-products';
import { registerBlockType } from '@wordpress/blocks';
import { sprintf, __ } from '@wordpress/i18n';
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
	affiliateLink: {
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
				title: sprintf(
					/* translators: planName can be any short name of WPCOM Plan bundle (ex. Personal, Permium, Business) */
					__( 'Upgrade %(planName)s', 'happy-blocks' ),
					{
						planName: getPlan( PLAN_PERSONAL )?.getTitle(),
					}
				),
				description: sprintf(
					/* translators: planName can be any short name of WPCOM Plan bundle (ex. Personal, Permium, Business) */
					__( 'Upgrade to %(planName)s pricing plan', 'happy-blocks' ),
					{
						planName: getPlan( PLAN_PERSONAL )?.getTitle(),
					}
				),
				attributes: {
					defaultProductSlug: PLAN_PERSONAL,
				},
			},
			{
				name: 'premium',
				title: sprintf(
					/* translators: planName can be any short name of WPCOM Plan bundle (ex. Personal, Permium, Business) */
					__( 'Upgrade %(planName)s', 'happy-blocks' ),
					{
						planName: getPlan( PLAN_PREMIUM )?.getTitle(),
					}
				),
				description: sprintf(
					/* translators: planName can be any short name of WPCOM Plan bundle (ex. Personal, Permium, Business) */
					__( 'Upgrade to %(planName)s pricing plan', 'happy-blocks' ),
					{
						planName: getPlan( PLAN_PREMIUM )?.getTitle(),
					}
				),
				attributes: {
					defaultProductSlug: PLAN_PREMIUM,
				},
			},
			{
				name: 'business',
				title: sprintf(
					/* translators: planName can be any short name of WPCOM Plan bundle (ex. Personal, Permium, Business) */
					__( 'Upgrade %(planName)s', 'happy-blocks' ),
					{
						planName: getPlan( PLAN_BUSINESS )?.getTitle(),
					}
				),
				description: sprintf(
					/* translators: planName can be any short name of WPCOM Plan bundle (ex. Personal, Permium, Business) */
					__( 'Upgrade to %(planName)s pricing plan', 'happy-blocks' ),
					{
						planName: getPlan( PLAN_BUSINESS )?.getTitle(),
					}
				),
				attributes: {
					defaultProductSlug: PLAN_BUSINESS,
				},
			},
			{
				name: 'ecommerce',
				title: sprintf(
					/* translators: planName can be any short name of WPCOM Plan bundle (ex. Personal, Permium, Business) */
					__( 'Upgrade %(planName)s', 'happy-blocks' ),
					{
						planName: getPlan( PLAN_ECOMMERCE )?.getTitle(),
					}
				),
				description: sprintf(
					/* translators: planName can be any short name of WPCOM Plan bundle (ex. Personal, Permium, Business) */
					__( 'Upgrade to %(planName)s pricing plan', 'happy-blocks' ),
					{
						planName: getPlan( PLAN_ECOMMERCE )?.getTitle(),
					}
				),
				attributes: {
					defaultProductSlug: PLAN_ECOMMERCE,
				},
			},
		],
	} );
}

registerBlocks();
