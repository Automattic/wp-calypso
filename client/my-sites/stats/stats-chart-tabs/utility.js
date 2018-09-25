/** @format */

/**
 * External dependencies
 */
import moment from 'moment';
import { omitBy, isNull, merge, memoize } from 'lodash';

/**
 * Internal dependencies
 */
import { rangeOfPeriod } from 'state/stats/lists/utils';
import {
	isRequestingSiteStatsForQuery,
	getSiteStatsNormalizedData,
} from 'state/stats/lists/selectors';

export const QUERY_FIELDS = [ 'views', 'visitors', 'likes', 'comments', 'post_titles' ];

export function formatDate( date, period ) {
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

export function generateQueries( period, date, quantity ) {
	const baseQuery = { unit: period, date, quantity };
	return Object.assign(
		...QUERY_FIELDS.map( field => ( { [ field ]: { ...baseQuery, stat_fields: field } } ) )
	);
}

export const mergeQueryResults = memoize( function( results, id = 'period' ) {
	const combinedResults = new Map();
	results.forEach( resultsOfType => {
		resultsOfType.forEach( result => {
			const nextResult = combinedResults.has( result[ id ] )
				? merge( combinedResults.get( result[ id ] ), omitBy( result, isNull ) )
				: result;
			combinedResults.set( result[ id ], nextResult );
		} );
	} );
	return [ ...combinedResults.values() ];
} );

export function getMergedData( state, siteId, queries ) {
	return mergeQueryResults(
		Object.values( queries ).map( query =>
			getSiteStatsNormalizedData( state, siteId, 'statsVisits', query )
		)
	);
}

export function getRequestStatuses( state, siteId, queries ) {
	return Object.assign(
		...Object.values( queries ).map( query => ( {
			[ query ]: isRequestingSiteStatsForQuery( state, siteId, 'statsVisits', query ),
		} ) )
	);
}
