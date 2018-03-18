/**
 * External dependencies
 *
 * @format
 */
import { moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { getUnitPeriod, getStartDate } from 'woocommerce/app/store-stats/utils';
import { UNITS, dashboardListLimit } from 'woocommerce/app/store-stats/constants';

export const getQueries = unit => {
	const baseQuery = {
		unit: unit,
		date: getUnitPeriod( getStartDate( moment().format( 'YYYY-MM-DD' ), unit ), unit ),
	};

	const orderQuery = {
		...baseQuery,
		quantity: UNITS[ unit ].quantity,
	};

	const referrerQuery = {
		...baseQuery,
		quantity: 1,
	};

	const topEarnersQuery = {
		...baseQuery,
		date: getUnitPeriod( moment().format( 'YYYY-MM-DD' ), unit ),
		limit: dashboardListLimit,
	};

	const visitorQuery = {
		...baseQuery,
		date: moment().format( 'YYYY-MM-DD' ),
		quantity: UNITS[ unit ].quantity,
	};

	return {
		orderQuery,
		referrerQuery,
		topEarnersQuery,
		visitorQuery,
	};
};
