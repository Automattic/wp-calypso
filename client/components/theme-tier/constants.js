import {
	PLAN_BUSINESS,
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
} from '@automattic/calypso-products';
import { translate } from 'i18n-calypso';

// This should be kept consistent with the theme_tier taxonomy.
export const THEME_TIERS = {
	free: {
		label: translate( 'Free' ),
		plan: PLAN_FREE,
	},
	personal: {
		label: translate( 'Personal' ),
		plan: PLAN_PERSONAL,
	},
	premium: {
		label: translate( 'Premium' ),
		plan: PLAN_PREMIUM,
	},
	partner: {
		label: translate( 'Partner', {
			context: 'This theme is developed and supported by a theme partner',
		} ),
		plan: PLAN_BUSINESS,
	},
	woocommerce: {
		label: translate( 'WooCommerce' ),
		plan: PLAN_BUSINESS,
	},
	sensei: {
		label: translate( 'Sensei' ),
		plan: PLAN_BUSINESS,
	},
};
