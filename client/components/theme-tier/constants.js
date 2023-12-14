import {
	PLAN_BUSINESS,
	PLAN_FREE,
	PLAN_PERSONAL,
	PLAN_PREMIUM,
} from '@automattic/calypso-products';

export const THEME_TIER_TO_PLAN = {
	free: PLAN_FREE,
	personal: PLAN_PERSONAL,
	premium: PLAN_PREMIUM,
	partner: PLAN_BUSINESS,
	woocommerce: PLAN_BUSINESS,
};
