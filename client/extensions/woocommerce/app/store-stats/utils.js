/**
 * External dependencies
 */
import { includes } from 'lodash';
import classnames from 'classnames';

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
