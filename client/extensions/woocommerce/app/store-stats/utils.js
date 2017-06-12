/**
 * External dependencies
 */
import { includes } from 'lodash';
import classnames from 'classnames';
import { moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { UNITS } from './constants';

/**
 * @typedef {Object} Delta
 * @property {string} classes - CSS classes to be used to render arrows
 * @property {string} since - Use of labels to create a phrase, "Since May 2"
 * @property {Array} value - Value as a percent
 */

/**
 * Calculate all elements needed to render a delta on a time series.
 *
 * @param {Object} item - data point from a time series
 * @param {Object|undefined} previousItem - the previous data point, if it exists
 * @param {string} attr - the property name to compare
 * @param {string} unit - day, week, month, or year
 * @return {Delta} - An object used to render the UI element
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
	const isIncreaseFavorable = includes( negativeIsBeneficialAttributes, attr ) ? ! isIncrease : isIncrease;
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
 * Given a startDate query parameter, determine which date to send the backend on a request for data.
 * Calculate a queryDate as the first date in each block of periods counting back from today. The number
 * of periods in a block is determined in the UNITS constants config.
 *
 * @param {object} context - Object supplied by page function
 * @return {string} - YYYY-MM-DD format of the date to be queried
 */
export function getQueryDate( context ) {
	const { unit } = context.params;
	const unitConfig = UNITS[ unit ];
	const today = moment();
	const startDate = moment( context.query.startDate ); // Defaults to today if startDate undefined
	const duration = moment.duration( today - startDate )[ unitConfig.durationFn ]();
	const validDuration = duration > 0 ? duration : 0;
	const unitQuantity = unitConfig.quantity;
	const periods = Math.floor( validDuration / unitQuantity ) * unitQuantity;
	return today.subtract( periods, unitConfig.label ).format( 'YYYY-MM-DD' );
}
