/** @format */

/**
 * External dependencies
 */
import moment from 'moment';

/**
 * Internal dependencies
 */
import { rangeOfPeriod } from 'state/stats/lists/utils';

export function formatDate( date, period ) {
	// NOTE: Consider localizing the dates, especially for the 'week' case.
	const momentizedDate = moment( date );
	switch ( period ) {
		case 'day':
			return momentizedDate.format( 'LL' );
		case 'week':
			return momentizedDate.format( 'L' ) + ' - ' + momentizedDate.add( 6, 'days' ).format( 'L' );
		case 'month':
			return momentizedDate.format( 'MMMM YYYY' );
		case 'year':
			return momentizedDate.format( 'YYYY' );
		default:
			return null;
	}
}

export function getQueryDate( queryDate, timezoneOffset, period, quantity ) {
	const momentSiteZone = moment().utcOffset( timezoneOffset );
	const endOfPeriodDate = rangeOfPeriod( period, momentSiteZone.locale( 'en' ) ).endOf;
	const periodDifference = moment( endOfPeriodDate ).diff( moment( queryDate ), period );
	if ( periodDifference >= quantity ) {
		return moment( endOfPeriodDate )
			.subtract( Math.floor( periodDifference / quantity ) * quantity, period )
			.format( 'YYYY-MM-DD' );
	}
	return endOfPeriodDate;
}
