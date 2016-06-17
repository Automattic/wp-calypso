/**
 * Internal dependencies
 */
import { PLAN_PERSONAL } from './constants';

export default {
	product_id: 1009,
	product_name: 'WordPress.com Personal',
	prices: { USD: 71.88 },
	product_name_short: 'Personal',
	product_slug: PLAN_PERSONAL,
	tagline: 'Get your own domain',
	shortdesc: 'Use your own domain and establish your online presence without ads.',
	description: 'Use your own domain and establish your online presence without ads.',
	capability: 'manage_options',
	cost: 71.88,
	features_highlight: [
		{ items: [ 'no-adverts/no-adverts.php', 'custom-domain', 'support', 'space' ] },
		{ title: 'Included with all plans:', items: [ 'free-blog' ] }
	],
	bill_period: 365,
	product_type: 'bundle',
	available: 'yes',
	bundle_product_ids: [ 12, 9, 50, 5, 6, 46, 54, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 72, 73, 74, 75, 16 ],
	bill_period_label: 'per year',
	price: '$71.88',
	formatted_price: '$71.88',
	raw_price: 71.88
};
