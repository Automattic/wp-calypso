/**
 * External dependencies
 */
import { sortBy, toPairs, camelCase, mapKeys, isNumber, get, filter, map } from 'lodash';
import { moment } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { PUBLICIZE_SERVICES_LABEL_ICON } from './constants';

/**
 * Returns an object with the startOf and endOf dates
 * for the given stats period and date
 *
 * @param  {String} period Stats query
 * @param  {String} date   Stats date
 * @return {Object}        Period range
 */
export function rangeOfPeriod( period, date ) {
	const momentDate = moment( date ).locale( 'en' );
	const startOf = momentDate.clone().startOf( period );
	const endOf = momentDate.clone().endOf( period );

	if ( 'week' === period ) {
		if ( '0' === momentDate.format( 'd' ) ) {
			startOf.subtract( 6, 'd' );
		} else {
			startOf.add( 1, 'd' );
			endOf.add( 1, 'd' );
		}
	}
	return {
		startOf: startOf.format( 'YYYY-MM-DD' ),
		endOf: endOf.format( 'YYYY-MM-DD' )
	};
}

/**
 * Returns a serialized stats query, used as the key in the
 * `state.stats.lists.items` and `state.stats.lists.requesting` state objects.
 *
 * @param  {Object} query    Stats query
 * @return {String}          Serialized stats query
 */
export function getSerializedStatsQuery( query = {} ) {
	return JSON.stringify( sortBy( toPairs( query ), ( pair ) => pair[ 0 ] ) );
}

export const normalizers = {
	/**
	 * Returns a normalized payload from `/sites/{ site }/stats`
	 *
	 * @param  {Object} data    Stats data
	 * @return {Object?}        Normalized stats data
	 */
	stats( data ) {
		if ( ! data || ! data.stats ) {
			return null;
		}

		return mapKeys( data.stats, ( value, key ) => camelCase( key ) );
	},

	/**
	 * Returns a normalized payload from `/sites/{ site }/stats/insights`
	 *
	 * @param  {Object} data    Stats query
	 * @return {Object?}        Normalized stats data
	 */
	statsInsights: ( data ) => {
		if ( ! data || ! isNumber( data.highest_day_of_week ) ) {
			return {};
		}

		const {
			highest_hour,
			highest_day_percent,
			highest_day_of_week,
			highest_hour_percent
		} = data;

		// Adjust Day of Week from 0 = Monday to 0 = Sunday (for Moment)
		let dayOfWeek = highest_day_of_week + 1;
		if ( dayOfWeek > 6 ) {
			dayOfWeek = 0;
		}

		return {
			day: moment().day( dayOfWeek ).format( 'dddd' ),
			percent: Math.round( highest_day_percent ),
			hour: moment().hour( highest_hour ).startOf( 'hour' ).format( 'LT' ),
			hourPercent: Math.round( highest_hour_percent )
		};
	},

	/**
	 * Returns a normalized payload from `/sites/{ site }/stats/country-views`
	 *
	 * @param  {Object} data    Stats data
	 * @param  {Object} query   Stats query
	 * @return {Object?}        Normalized stats data
	 */
	statsCountryViews: ( data, query = {} ) => {
		// parsing a country-views response requires a period and date
		if ( ! data || ! query.period || ! query.date ) {
			return [];
		}
		const { startOf } = rangeOfPeriod( query.period, query.date );
		const countryInfo = get( data, [ 'country-info' ], {} );

		// the API response object shape depends on if this is a summary request or not
		const dataPath = query.summarize ? [ 'summary', 'views' ] : [ 'days', startOf, 'views' ];

		// filter out country views that have no legitimate country data associated with them
		const countryData = filter( get( data, dataPath, [] ), ( viewData ) => {
			return countryInfo[ viewData.country_code ];
		} );

		return map( countryData, ( viewData ) => {
			const country = countryInfo[ viewData.country_code ];
			const icon = country.flat_flag_icon.match( /grey\.png/ ) ? null : country.flat_flag_icon;

			// ’ in country names causes google's geo viz to break
			return {
				label: country.country_full.replace( /’/, "'" ),
				value: viewData.views,
				region: country.map_region,
				icon: icon
			};
		} );
	},

	/**
	 * Returns a normalized statsPublicize array, ready for use in stats-module
	 *
	 * @param  {Object} data Stats query
	 * @return {Array}       Parsed publicize data array
	 */
	statsPublicize( data = {} ) {
		if ( ! data || ! data.services ) {
			return [];
		}

		return data.services.map( ( service ) => {
			const { label, icon } = PUBLICIZE_SERVICES_LABEL_ICON[ service.service ];
			return { label, icon, value: service.followers };
		} );
	}
};
