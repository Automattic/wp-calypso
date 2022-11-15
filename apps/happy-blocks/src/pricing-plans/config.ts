/**
 * Load and export the pricing plans block configuration provided from the backend.
 */
const config = {
	plans: [ 'business', 'business-monthly', 'ecommerce', 'ecommerce-monthly' ],
	...( window.A8C_HAPPY_BLOCKS_CONFIG || {} ),
};

export default config;
