import {
	PLAN_BUSINESS,
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
	getPlan,
} from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';

/**
 * @typedef {Object} THEME_TIERS
 * @property {Object} [tier] A theme tier mapped to UI-related properties.
 * @description This map has to be kept consistent with the theme_tier taxonomy.
 */
/**
 * @typedef {Object} tier
 * @property {string} label The translated label of the theme tier.
 * @property {string} minimumUpsellPlan The minimum plan required to activate a theme belonging to the tier. Used for upselling purposes.
 */
// Once if the tier URL path thingy is resolved we could remove this file.
export const THEME_TIERS = {
	free: {
		label: translate( 'Free' ),
		minimumUpsellPlan: PLAN_FREE,
	},
	personal: {
		label: getPlan( PLAN_PERSONAL )?.getTitle(),
		minimumUpsellPlan: PLAN_PERSONAL,
	},
	premium: {
		label: getPlan( PLAN_PREMIUM )?.getTitle(),
		minimumUpsellPlan: PLAN_PREMIUM,
	},
	partner: {
		label: translate( 'Partner', {
			context: 'This theme is developed and supported by a theme partner',
		} ),
		minimumUpsellPlan: PLAN_BUSINESS,
	},
	woocommerce: {
		label: translate( 'WooCommerce' ),
		minimumUpsellPlan: PLAN_BUSINESS,
	},
	sensei: {
		label: translate( 'Sensei' ),
		minimumUpsellPlan: PLAN_BUSINESS,
	},
};
