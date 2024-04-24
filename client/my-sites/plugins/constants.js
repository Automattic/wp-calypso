import {
	PRODUCT_JETPACK_SEARCH,
	PRODUCT_JETPACK_SEARCH_FREE,
	PRODUCT_JETPACK_SEARCH_MONTHLY,
	WPCOM_FEATURES_INSTANT_SEARCH,
} from '@automattic/calypso-products';

export const PREINSTALLED_PLUGINS = [
	'jetpack',
	'akismet',
	'vaultpress',
	'gutenberg',
	'full-site-editing',
	'layout-grid',
	'page-optimize',
]; // These plugins auto update but shouldn't be deactivated.

export const PREINSTALLED_PREMIUM_PLUGINS = {
	'jetpack-search': {
		feature: WPCOM_FEATURES_INSTANT_SEARCH,
		jetpack_module: 'search',
		products: {
			free: PRODUCT_JETPACK_SEARCH_FREE,
			monthly: PRODUCT_JETPACK_SEARCH_MONTHLY,
			yearly: PRODUCT_JETPACK_SEARCH,
		},
	},
};

export const AUTOMOMANAGED_PLUGINS = [
	'woocommerce',
	'facebook-for-woocommerce',
	'woocommerce-services',
	'mailchimp-for-woocommerce',
	'woocommerce-gateway-stripe',
	'woocommerce-square',
	'woocommerce-gateway-paypal-express-checkout',
	'woocommerce-payfast-gateway',
	'woocommerce-gateway-eway',
	'taxjar-simplified-taxes-for-woocommerce',
	'klarna-payments-for-woocommerce',
	'klarna-checkout-for-woocommerce',
	'crowdsignal-forms',
	'polldaddy',
	'classic-editor',
	'wordpress-seo',
]; // These plugins auto update but can be activated / deactivated.

export const ECOMMERCE_BUNDLED_PLUGINS = [
	'woocommerce',
	'woocommerce-services',
	'woocommerce-product-addons',
	'woocommerce-gift-cards',
	'woocommerce-brands',
	'woocommerce-product-recommendations',
	'woocommerce-shipment-tracking',
	'woocommerce-google-analytics-integration',
	'crowdsignal-forms',
	'polldaddy',
	'woocommerce-payments',
	'woocommerce-eu-vat-numbe',
	'woocommerce-avatax',
	'woocommerce-shipping-australia-post',
	'woocommerce-shipping-canada-post',
	'woocommerce-shipping-fedex',
	'woocommerce-shipping-royalmail',
	'woocommerce-shipping-ups',
	'woocommerce-shipping-usps',
	'woocommerce-product-bundles',
	'woocommerce-min-max-quantities',
	'woocommerce-back-in-stock-notifications',
	'automatewoo',
	'taxjar-simplified-taxes-for-woocommerce',
	'facebook-for-woocommerce',
	'google-listings-and-ads',
	'pinterest-for-woocommerce',
	'tiktok-for-woocommerce',
	'mailpoet-business',
];

export const UNLISTED_PLUGINS = [ 'automated-db-schenker-shipping' ];

export const FREE_NON_ORG_PLUGINS = {
	bazaar: {
		name: 'Bazaar',
		slug: 'bazaar',
		software_slug: 'bazaar',
		org_slug: null,
		isMarketplaceProduct: false,
		isSaasProduct: false,
		wporg: false,
		short_description:
			'Maximize opportunities for both sellers and publishers. Sellers easily list their goods, while publishers effortlessly expand their offerings.',
		description:
			'Maximize opportunities for both sellers and publishers. Sellers easily list their goods, while publishers effortlessly expand their offerings.',
		requirements: { required_primary_domain: null, plugins: [ 'woocommerce' ], themes: [] },
		variations: null,
		icon: 'https://ps.w.org/woocommerce/assets/icon-256x256.gif?rev=2869506',
		banners: {
			high: 'https://ps.w.org/woocommerce/assets/banner-1544x500.png?rev=3000842',
		},
		tags: {
			plugins: 'Plugins',
			ecommerce: 'eCommerce',
			'store-management': 'Store Management',
		},
		sections: {
			description:
				'Maximize opportunities for both sellers and publishers. Sellers easily list their goods, while publishers effortlessly expand their offerings.',
			changelog: 'changelog',
			faq: 'faq',
			installation: 'installation',
		},
		rating: '80',
		reviews_link: null,
		author_name: 'Automattic',
		demo_url: null,
		documentation_url: null,
		version: '1.0.0',
		tested: '6.5.2',
		last_updated: '2024-04-24',
		product_video: null,
		setup_url: null,
		is_hidden: false,
		saas_landing_page: null,
	},
};
