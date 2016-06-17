import { translate } from 'i18n-calypso';

import { PLAN_PERSONAL } from './constants';

export default {
	product_id: 1009,
	product_name: translate( 'WordPress.com Personal' ),
	prices: {
		USD: 71.88,
		NZD: 105.35,
		AUD: 99.05,
		CAD: 94.05,
		JPY: 7874.06,
		EUR: 64.27,
		GBP: 49.86
	},
	product_name_short: translate( 'Personal' ),
	product_slug: PLAN_PERSONAL,
	tagline: translate( 'Get your own domain' ),
	shortdesc: translate( 'Use your own domain and establish your online presence without ads.' ),
	description: translate( 'Use your own domain and establish your online presence without ads.' ),
	capability: translate( 'manage_options' ),
	cost: 71.88,
	features_highlight: [
		{ items: [ 'no-adverts/no-adverts.php', 'custom-domain', 'support', 'space' ] },
		{ title: 'Included with all plans:', items: [ 'free-blog' ] }
	],
	bill_period: 365,
	product_type: 'bundle',
	available: 'yes',
	bundle_product_ids: [ 12, 9, 50, 5, 6, 46, 54, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 72, 73, 74, 75, 16 ],
	bill_period_label: translate( 'per year' ),
	price: '$71.88',
	formatted_price: '$71.88',
	raw_price: 71.88
};
