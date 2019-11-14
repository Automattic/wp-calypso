const woocommerce = {
	id: 'woocommerce/woocommerce',
	slug: 'woocommerce',
	active: true,
	name: 'WooCommerce',
	plugin_url: 'https://woocommerce.com/',
	version: '3.3.4',
	description: 'An eCommerce toolkit that helps you sell anything. Beautifully.',
	author: 'Automattic',
	author_url: 'https://woocommerce.com',
	network: false,
	autoupdate: true,
};

const woocommerceServices = {
	id: 'woocommerce-services/woocommerce-services',
	slug: 'woocommerce-services',
	active: true,
};

const woocommerceStripe = {
	id: 'woocommerce-gateway-stripe/woocommerce-gateway-stripe',
	slug: 'woocommerce-gateway-stripe',
	active: true,
};

export default {
	installed: {
		isRequesting: {
			1: false,
			2: false,
			3: false,
			4: true,
		},
		plugins: {
			1: [ woocommerce, woocommerceServices, woocommerceStripe ],
			2: [ woocommerce, woocommerceStripe, { ...woocommerceServices, active: false } ],
			3: [ woocommerce, woocommerceStripe ],
		},
	},
};
