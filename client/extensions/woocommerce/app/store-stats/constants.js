/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

export const sparkWidgetList1 = [
	{
		key: 'products',
		title: translate( 'Products Purchased' ),
		format: 'number'
	},
	{
		key: 'avg_products_per_order',
		title: translate( 'Products Per Order' ),
		format: 'number'
	},
	{
		key: 'coupons',
		title: translate( 'Coupons Used' ),
		format: 'number'
	}
];

export const sparkWidgetList2 = [
	{
		key: 'total_refund',
		title: translate( 'Refunds' ),
		format: 'currency'
	},
	{
		key: 'total_shipping',
		title: translate( 'Shipping' ),
		format: 'currency'
	},
	{
		key: 'total_tax',
		title: translate( 'Tax' ),
		format: 'currency'
	}
];

export const topProducts = {
	basePath: '/store/stats/products',
	title: translate( 'Most Popular Products' ),
	values: [
		{ key: 'name', title: translate( 'Title' ), format: 'text' },
		{ key: 'quantity', title: translate( 'Quantity' ), format: 'number' },
		{ key: 'total', title: translate( 'Sales' ), format: 'currency' },
	],
	empty: translate( 'No products found' ),
	statType: 'statsTopEarners',
};

export const topCategories = {
	basePath: '/store/stats/categories',
	title: translate( 'Top Categories' ),
	values: [
		{ key: 'name', title: translate( 'Title' ), format: 'text' },
		{ key: 'quantity', title: translate( 'Quantity' ), format: 'number' },
		{ key: 'total', title: translate( 'Total' ), format: 'currency' },
	],
	empty: translate( 'No categories found' ),
	statType: 'statsTopCategories',
};

export const topCoupons = {
	basePath: '/store/stats/coupons',
	title: translate( 'Most Used Coupons' ),
	values: [
		{ key: 'name', title: translate( 'Title' ), format: 'text' },
		{ key: 'quantity', title: translate( 'Quantity' ), format: 'number' },
		{ key: 'total', title: translate( 'Total' ), format: 'currency' },
	],
	empty: translate( 'No coupons found' ),
	statType: 'statsTopCoupons',
};

export const UNITS = {
	day: {
		quantity: 30,
		label: 'days',
		durationFn: 'asDays',
		format: 'YYYY-MM-DD',
	},
	week: {
		quantity: 30,
		label: 'weeks',
		durationFn: 'asWeeks',
		format: 'YYYY-[W]WW',
	},
	month: {
		quantity: 30,
		label: 'months',
		durationFn: 'asMonths',
		format: 'YYYY-MM'
	},
	year: {
		quantity: 10,
		label: 'years',
		durationFn: 'asYears',
		format: 'YYYY',
	},
};
