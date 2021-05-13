/**
 * External dependencies
 */

import { translate } from 'i18n-calypso';

const sparkWidgetList1 = [
	{
		key: 'products',
		title: translate( 'Products Purchased' ),
		format: 'number',
	},
	{
		key: 'avg_products_per_order',
		title: translate( 'Products Per Order' ),
		format: 'number',
	},
	{
		key: 'coupons',
		title: translate( 'Coupons Used' ),
		format: 'number',
	},
];

const sparkWidgetList2 = [
	{
		key: 'total_refund',
		title: translate( 'Refunds' ),
		format: 'currency',
	},
	{
		key: 'total_shipping',
		title: translate( 'Shipping' ),
		format: 'currency',
	},
	{
		key: 'total_tax',
		title: translate( 'Tax' ),
		format: 'currency',
	},
];

export const sparkWidgets = [ sparkWidgetList1, sparkWidgetList2 ];

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
		shortFormat: 'MMM D',
		chartFormat: 'labelDay',
		title: translate( 'Days' ),
	},
	week: {
		quantity: 30,
		label: 'weeks',
		durationFn: 'asWeeks',
		format: 'YYYY-[W]WW',
		shortFormat: 'MMM D',
		chartFormat: 'labelWeek',
		title: translate( 'Weeks' ),
	},
	month: {
		quantity: 12,
		label: 'months',
		durationFn: 'asMonths',
		format: 'YYYY-MM',
		shortFormat: "MMM [']YY",
		chartFormat: 'labelMonth',
		title: translate( 'Months' ),
	},
	year: {
		quantity: 10,
		label: 'years',
		durationFn: 'asYears',
		format: 'YYYY',
		shortFormat: 'YYYY',
		chartFormat: 'labelYear',
		title: translate( 'Years' ),
	},
};

export const chartTabs = [
	{
		label: translate( 'Gross Sales' ),
		attr: 'gross_sales',
		type: 'currency',
		tabLabel: translate( 'Sales' ),
		availableCharts: [ 'net_sales' ],
	},
	{ label: translate( 'Orders' ), attr: 'orders', type: 'number', availableCharts: [] },
	{
		label: translate( 'Average Order Value' ),
		attr: 'avg_order_value',
		type: 'currency',
		availableCharts: [],
	},
	{
		label: translate( 'Net Sales' ),
		attr: 'net_sales',
		isHidden: true,
		availableCharts: [],
		type: 'currency',
	},
];

export const referrerChartTabs = [
	{
		label: translate( 'Views' ),
		attr: 'product_views',
		gridicon: 'visible',
		availableCharts: [ 'add_to_carts' ],
		type: 'number',
	},
	{
		label: translate( 'Add to Carts' ),
		attr: 'add_to_carts',
		gridicon: 'cart',
		availableCharts: [ 'product_purchases' ],
		type: 'number',
	},
	{
		label: translate( 'Purchases' ),
		attr: 'product_purchases',
		gridicon: 'star',
		availableCharts: [],
		type: 'number',
	},
	{
		label: translate( 'Sales' ),
		attr: 'sales',
		gridicon: 'money',
		availableCharts: [],
		type: 'currency',
	},
];

export const dashboardListLimit = 3;

export const noDataMsg = translate( 'No data found' );
