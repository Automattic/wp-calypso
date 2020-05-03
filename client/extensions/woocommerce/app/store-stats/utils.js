/**
 * External dependencies
 */
import { find, includes, forEach, findIndex, round } from 'lodash';
import classnames from 'classnames';
import { translate, numberFormat } from 'i18n-calypso';
import qs from 'qs';
import formatCurrency from '@automattic/format-currency';
import moment from 'moment'; // No localization needed in this file.

/**
 * Internal dependencies
 */
import { UNITS } from './constants';

/**
 * @typedef {object} Delta
 * @property {string} classes - CSS classes to be used to render arrows
 * @property {string} since - Use of labels to create a phrase, "Since May 2"
 * @property {Array} value - Value as a percent
 */

/**
 * Calculate all elements needed to render a delta on a time series.
 *
 * @param {object} item - data point from a time series
 * @param {object|undefined} previousItem - the previous data point, if it exists
 * @param {string} attr - the property name to compare
 * @param {string} unit - day, week, month, or year
 * @returns {Delta} - An object used to render the UI element
 */
export function calculateDelta( item, previousItem, attr, unit ) {
	const negativeIsBeneficialAttributes = [ 'total_refund' ];
	const sinceLabels = {
		day: 'labelDay',
		week: 'labelWeek',
		month: 'labelMonth',
		year: 'labelYear',
	};
	let value = 0;
	if ( previousItem && previousItem[ attr ] !== 0 ) {
		const current = item[ attr ];
		const previous = previousItem[ attr ];
		value = Math.round( ( ( current - previous ) / previous ) * 100 );
	}
	const isIncrease = value > 0;
	const isIncreaseFavorable = includes( negativeIsBeneficialAttributes, attr )
		? ! isIncrease
		: isIncrease;
	const classes = classnames( {
		'is-neutral': value === 0,
		'is-increase': value > 0,
		'is-decrease': value < 0,
		'is-favorable': value !== 0 && isIncreaseFavorable,
		'is-unfavorable': value !== 0 && ! isIncreaseFavorable,
	} );
	const since = previousItem ? `since ${ previousItem[ sinceLabels[ unit ] ] }` : null;
	return {
		classes: classes.split( ' ' ),
		since,
		value: `${ Math.abs( value ) }%`,
	};
}

/**
 * Calculate a date as the first date in each block of periods counting back from today. The number
 * of periods in a block is determined in the UNITS constants config.
 *
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
 *
 * @param {object} context - Object supplied by page function
 * @returns {string} - YYYY-MM-DD format of the date to be queried
 */
export function getQueryDate( context ) {
	const { unit } = context.params;
	return getStartDate( context.query.startDate, unit );
}

/**
 * Given a full date YYYY-MM-DD and unit ('day', 'week', 'month', 'year') return a shortened
 * and contextually relevant date.
 *
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
 *
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
 * Given a full date YYYY-MM-DD and unit ('day', 'week', 'month', 'year') return the first date
 * for the period formatted as YYYY-MM-DD
 *
 * @param {string} date - string date in YYYY-MM-DD format
 * @param {string} unit - string representing unit required for API eg. ('day', 'week', 'month', 'year')
 * @returns {string} - YYYY-MM-DD format of the date to be queried
 */
export function getStartPeriod( date, unit ) {
	return unit === 'week'
		? moment( date ).startOf( 'isoWeek' ).format( 'YYYY-MM-DD' )
		: moment( date ).startOf( unit ).format( 'YYYY-MM-DD' );
}

/**
 * Given a value and format option of 'text', 'number' and 'currency' return a formatted value.
 *
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
			return numberFormat( value, decimals );
		case 'percent':
			return translate( '%(percentage)s%% ', { args: { percentage: value }, context: 'percent' } );
		case 'text':
		default:
			return value;
	}
}

/**
 * Given a date, return the delta object for a specific stat
 *
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
 * Given a date, an array of data, and a stat, return a delta object for the specific stat.
 *
 * @param {Array} data - an array of API data, must contain at least 3 rows
 * @param {string} selectedDate - string of date in 'YYYY-MM-DD'
 * @param {string} stat - string of stat to be referenced
 * @param {string} unit - unit/period format for the data provided
 * @returns {object} - Object containing data from calculateDelta
 */
export function getDeltaFromData( data, selectedDate, stat, unit ) {
	if ( ! data || ! Array.isArray( data ) || data.length < 3 ) {
		return {};
	}
	let delta = {};
	let previousItem = false;

	forEach( data, function ( item ) {
		if ( previousItem ) {
			if ( item.period === selectedDate ) {
				delta = calculateDelta( item, previousItem, stat, unit );
			}
			previousItem = item;
		} else {
			previousItem = item;
		}
	} );

	return delta;
}

/**
 * Given visitor data and order data, get a list conversion rate by period.
 *
 * @param {Array} visitorData - an array of API data from the 'visits' stat endpoint
 * @param {Array} orderData -  an array of API data from the orders endpoint
 * @param {string} unit - unit/period format for the data provided
 * @returns {object} - Object containing data from calculateDelta
 */
export function getConversionRateData( visitorData, orderData, unit ) {
	return visitorData.map( ( visitorRow ) => {
		const datePeriod = getEndPeriod( visitorRow.period, unit );
		const unitPeriod = getUnitPeriod( visitorRow.period, unit );
		const index = findIndex( orderData, ( d ) => d.period === datePeriod );
		const orders = orderData[ index ] && orderData[ index ].orders;

		if ( visitorRow.visitors > 0 && orderData[ index ] ) {
			return {
				period: unitPeriod,
				conversionRate: round( ( orders / visitorRow.visitors ) * 100, 2 ),
			};
		}
		return { period: unitPeriod, conversionRate: 0 };
	} );
}

/**
 * Given a unit and basedate, generate the queries needed for QuerySiteStats and getSiteStatsNormalizedData.
 * An optional overrides object can be passed to change values. Currently accepted:
 * orderQuery, referrerQuery, topEarnersQuery, visitorQuery.
 *
 * @param {string} unit - unit/period format for the data provided
 * @param {string} baseDate - string of date in 'YYYY-MM-DD'
 * @param {object} overrides - Object of query overrides. Example: { referrerQuery: { quantity: 1 }
 * @returns {object} - Object containing data from calculateDelta
 */
export function getQueries( unit, baseDate, overrides = {} ) {
	const baseQuery = { unit };

	const orderQuery = {
		...baseQuery,
		date: getUnitPeriod( baseDate, unit ),
		quantity: UNITS[ unit ].quantity,
		...( overrides.orderQuery || {} ),
	};

	const referrerQuery = {
		...baseQuery,
		date: getUnitPeriod( baseDate, unit ),
		quantity: UNITS[ unit ].quantity,
		...( overrides.referrerQuery || {} ),
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
		referrerQuery,
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
 *
 * @param {string} unit - day, week, month, or year
 * @param {string} slug - site slug
 * @param {object} urlQuery - url query params represented as an object
 * @returns {string} - widget path url portion
 */
export function getWidgetPath( unit, slug, urlQuery ) {
	const query = qs.stringify( urlQuery, { addQueryPrefix: true } );
	return `/${ unit }/${ slug }${ query }`;
}
