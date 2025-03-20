import {
	PLAN_BUSINESS,
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	getPlan,
} from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';

const getIncludedWithLabel = ( planSlug ) => {
	return translate( 'Included with %(planName)s', {
		args: { planName: getPlan( planSlug )?.getTitle() },
	} );
};

export const THEME_TIER_PREMIUM = 'premium';
export const THEME_TIER_PARTNER = 'partner';
export const THEME_TIER_FREE = 'free';

/**
 * @typedef {Object} THEME_TIERS
 * @property {Object} [tier] A theme tier mapped to UI-related properties.
 * @description This map has to be kept consistent with the theme_tier taxonomy.
 */
/**
 * @typedef {Object} tier
 * @property {string} label The translated label of the theme tier.
 * @property {string} minimumUpsellPlan The minimum plan required to activate a theme belonging to the tier. Used for upselling purposes.
 * @property {boolean} isFilterable Whether the tier can be used to filter the Theme Showcase.
 */
export const THEME_TIERS = {
	free: {
		get label() {
			return translate( 'Free' );
		},
		minimumUpsellPlan: PLAN_FREE,
		isFilterable: true,
	},
	personal: {
		get label() {
			return getIncludedWithLabel( PLAN_PERSONAL );
		},
		minimumUpsellPlan: PLAN_PERSONAL,
		isFilterable: true,
	},
	[ THEME_TIER_PREMIUM ]: {
		get label() {
			return getIncludedWithLabel( PLAN_PREMIUM );
		},
		minimumUpsellPlan: PLAN_PREMIUM,
		isFilterable: true,
	},
	[ THEME_TIER_PARTNER ]: {
		get label() {
			return translate( 'Partner', {
				context: 'This theme is developed and supported by a theme partner',
			} );
		},
		minimumUpsellPlan: PLAN_BUSINESS,
		isFilterable: true,
	},
	woocommerce: {
		get label() {
			return translate( 'WooCommerce' );
		},
		minimumUpsellPlan: PLAN_BUSINESS,
		isFilterable: true,
	},
	sensei: {
		get label() {
			return translate( 'Sensei LMS' );
		},
		minimumUpsellPlan: PLAN_BUSINESS,
		isFilterable: false,
	},
	community: {
		get label() {
			return translate( 'Community' );
		},
		minimumUpsellPlan: PLAN_BUSINESS,
		isFilterable: false,
	},
};
