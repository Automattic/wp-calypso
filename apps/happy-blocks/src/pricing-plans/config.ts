import {
	PLAN_PREMIUM_MONTHLY,
	PLAN_PREMIUM,
	PLAN_BUSINESS_MONTHLY,
	PLAN_BUSINESS,
	PLAN_ECOMMERCE_MONTHLY,
	PLAN_ECOMMERCE,
} from '@automattic/calypso-products';

/**
 * Load and export the pricing plans block configuration provided from the backend.
 */
const config = {
	plans: [
		PLAN_PREMIUM_MONTHLY,
		PLAN_PREMIUM,
		PLAN_BUSINESS_MONTHLY,
		PLAN_BUSINESS,
		PLAN_ECOMMERCE_MONTHLY,
		PLAN_ECOMMERCE,
	],
	...( window.A8C_HAPPY_BLOCKS_CONFIG || {} ),
};

export default config;
