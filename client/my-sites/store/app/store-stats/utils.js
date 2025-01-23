import formatCurrency from '@automattic/format-currency';
import { translate, numberFormat } from 'i18n-calypso';
import { find } from 'lodash';
import moment from 'moment'; // No localization needed in this file.
import qs from 'qs';
import { UNITS } from './constants';

/**
 * Calculate a date as the first date in each block of periods counting back from today. The number
 * of periods in a block is determined in the UNITS constants config.
 * @param {string} date - Date to calculate from
 * @param {string} unit - Unit to use in calculation
 * @returns {string} - YYYY-MM-DD format of the date to be queried
 */
export function getStartDate( date, unit ) {
	const unitConfig = UNITS[ unit ];
	const today = moment();
	const startDate = moment( date ); // Defaults to today if startDate undefined
	const duration = moment.duration( today - startDate )[ unitConfig.durationFn ]();
	const validDuration = duration > 0 ? duration : 0;
	const unitQuantity = unitConfig.quantity;
	const periods = Math.floor( validDuration / unitQuantity ) * unitQuantity;
	return today.subtract( periods, unitConfig.label ).format( 'YYYY-MM-DD' );
}

/**
 * Given a startDate query parameter, determine which date to send the backend on a request for data.
 * @param {Object} context - Object supplied by page function
 * @returns {string} - YYYY-MM-DD format of the date to be queried
 */
export function getQueryDate( context ) {
	const { unit } = context.params;
	return getStartDate( context.query.startDate, unit );
}

/**
 * Given a full date YYYY-MM-DD and unit ('day', 'week', 'month', 'year') return a shortened
 * and contextually relevant date.
 * @param {string} date - string date in YYYY-MM-DD format
 * @param {string} unit - string representing unit required for API eg. ('day', 'week', 'month', 'year')
 * @returns {string} - as required by the API, eg for unit 'week', '2017-W27' isoWeek returned
 */
export function getUnitPeriod( date, unit ) {
	return moment( date ).format( UNITS[ unit ].format );
}

/**
 * Given a full date YYYY-MM-DD and unit ('day', 'week', 'month', 'year') return the last date
 * for the period formatted as YYYY-MM-DD
 * @param {string} date - string date in YYYY-MM-DD format
 * @param {string} unit - string representing unit required for API eg. ('day', 'week', 'month', 'year')
 * @returns {string} - YYYY-MM-DD format of the date to be queried
 */
export function getEndPeriod( date, unit ) {
	return unit === 'week'
		? moment( date ).endOf( 'isoWeek' ).format( 'YYYY-MM-DD' )
		: moment( date ).endOf( unit ).format( 'YYYY-MM-DD' );
}

/**
 * Given a value and format option of 'text', 'number' and 'currency' return a formatted value.
 * @param {(string|number)} value - string or number to be formatted
 * @param {string} format - string of 'text', 'number' or 'currency'
 * @param {string} [code] - optional currency code
 * @param {number} [decimals] - optional number of decimal places
 * @returns {string|number} - formatted number or string value
 */
export function formatValue( value, format, code, decimals ) {
	switch ( format ) {
		case 'currency':
			return formatCurrency( value, code );
		case 'number':
			return numberFormat( value, { ...( typeof decimals === 'number' && { decimals } ) } );
		case 'percent':
			return translate( '%(percentage)s%% ', { args: { percentage: value }, context: 'percent' } );
		case 'text':
		default:
			return value;
	}
}

/**
 * Given a date, return the delta object for a specific stat
 * @param {Array} deltas - an array of delta objects
 * @param {string} selectedDate - string of date in 'YYYY-MM-DD'
 * @param {string} stat - string of stat to be referenced
 * @returns {Array} - array of delta objects matching selectedDate
 */
export function getDelta( deltas, selectedDate, stat ) {
	const selectedDeltas = find( deltas, ( item ) => item.period === selectedDate );
	return ( selectedDeltas && selectedDeltas[ stat ] ) || [];
}

/**
 * Given a unit and basedate, generate the queries needed for QuerySiteStats and getSiteStatsNormalizedData.
 * An optional overrides object can be passed to change values. Currently accepted:
 * orderQuery, topEarnersQuery, visitorQuery.
 * @param {string} unit - unit/period format for the data provided
 * @param {string} baseDate - string of date in 'YYYY-MM-DD'
 * @param {Object} overrides - Object of query overrides. Example: { orderQuery: { quantity: 1 }
 * @returns {Object}
 */
export function getQueries( unit, baseDate, overrides = {} ) {
	const baseQuery = { unit };

	const orderQuery = {
		...baseQuery,
		date: getUnitPeriod( baseDate, unit ),
		quantity: UNITS[ unit ].quantity,
		...( overrides.orderQuery || {} ),
	};

	const topListQuery = {
		...baseQuery,
		date: getUnitPeriod( baseDate, unit ),
		limit: 10,
		...( overrides.topListQuery || {} ),
	};

	const visitorQuery = {
		...baseQuery,
		date: baseDate,
		quantity: UNITS[ unit ].quantity,
		...( overrides.visitorQuery || {} ),
	};

	return {
		orderQuery,
		topListQuery,
		visitorQuery,
	};
}

/**
 * Create the common Store Stats url ending used for links to widgets and lists. Url query parameters
 * persist from view to view (ie, startDate) and should be reflected in the url.
 * Url's have this basic shape:
 *
 * /store/stats/<page>/<unit>/<slug>?param1=1&param2=2
 *
 * this util is for constructing the /<unit>/<slug>?param1=1&param2=2
 * @param {string} unit - day, week, month, or year
 * @param {string} slug - site slug
 * @param {Object} urlQuery - url query params represented as an object
 * @returns {string} - widget path url portion
 */
export function getWidgetPath( unit, slug, urlQuery ) {
	const query = qs.stringify( urlQuery, { addQueryPrefix: true } );
	return `/${ unit }/${ slug }${ query }`;
}
