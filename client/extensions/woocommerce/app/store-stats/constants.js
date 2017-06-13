/**
 * External dependencies
 */
import { translate } from 'i18n-calypso';

export const topProducts = {
	title: translate( 'Products' ),
	values: [
		{ key: 'name', title: translate( 'Title' ) },
		{ key: 'price', title: translate( 'Price' ) },
		{ key: 'total', title: translate( 'Sales' ) },
	],
	empty: translate( 'No products found' ),
	statType: 'statsTopEarners',
};

export const topCategories = {
	title: translate( 'Categories' ),
	values: [
		{ key: 'name', title: translate( 'Title' ) },
		{ key: 'quantity', title: translate( 'Quantity' ) },
		{ key: 'total', title: translate( 'Total' ) },
	],
	empty: translate( 'No categories found' ),
	statType: 'statsTopCategories',
};

export const topCoupons = {
	title: translate( 'Coupons' ),
	values: [
		{ key: 'name', title: translate( 'Title' ) },
		{ key: 'quantity', title: translate( 'Quantity' ) },
		{ key: 'total', title: translate( 'Total' ) },
	],
	empty: translate( 'No coupons found' ),
	statType: 'statsTopCoupons',
};

export const UNITS = {
	day: {
		quantity: 30,
		label: 'days',
		durationFn: 'asDays',
	},
	week: {
		quantity: 30,
		label: 'weeks',
		durationFn: 'asWeeks',
	},
	month: {
		quantity: 30,
		label: 'months',
		durationFn: 'asMonths',
	},
	year: {
		quantity: 10,
		label: 'years',
		durationFn: 'asYears',
	},
};
