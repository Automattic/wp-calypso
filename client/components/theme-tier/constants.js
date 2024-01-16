import {
	PLAN_BUSINESS,
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
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
export const THEME_TIERS = {
	free: {
		label: translate( 'Free' ),
		minimumUpsellPlan: PLAN_FREE,
	},
	personal: {
		label: translate( 'Starter' ),
		minimumUpsellPlan: PLAN_PERSONAL,
	},
	premium: {
		label: translate( 'Explorer' ),
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
