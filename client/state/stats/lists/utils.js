/**
 * External dependencies
 */
import { sortBy, toPairs, camelCase, mapKeys, isNumber, get, filter, map, concat, flatten } from 'lodash';
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
 * Builds data into escaped array for CSV export
 *
 * @param  {Object} data   Normalized stats data object
 * @param  {String} parent Label of parent
 * @return {Array}         CSV Row
 */
export function buildExportArray( data, parent = null ) {
	if ( ! data || ! data.label || ! data.value ) {
		return [];
	}
	const label = parent ? ( parent + ' > ' + data.label ) : data.label;
	const escapedLabel = label.replace( /\"/, '""' );
	let exportData = [ [ '"' + escapedLabel + '"', data.value ] ];

	if ( data.children ) {
		const childData = map( data.children, ( child ) => {
			return buildExportArray( child, label );
		} );

		exportData = concat( exportData, flatten( childData ) );
	}

	return exportData;
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
	 * Returns a normalized payload from `/sites/{ site }/stats/top-posts`
	 *
	 * @param  {Object} data    Stats data
	 * @param  {Object} query   Stats query
	 * @return {Object?}        Normalized stats data
	 */
	statsTopPosts: ( data, query ) => {
		if ( ! data || ! query.period || ! query.date ) {
			return [];
		}

		const { startOf, endOf } = rangeOfPeriod( query.period, query.date );
		const dataPath = query.summarize ? [ 'summary', 'postviews' ] : [ 'days', startOf, 'postviews' ];
		const viewData = get( data, dataPath, [] );

		return map( viewData, ( item ) => {
			const detailPage = `/stats/post/${ item.id }/${ query.domain }`;
			let inPeriod = false;

			// Archive and home pages do not have dates
			if ( item.date ) {
				const postDate = moment( item.date );
				// TODO: might be nice to update moment and use isSameOrAfter and isSameOrBefore
				if (
					( postDate.isAfter( startOf, 'day' ) || postDate.isSame( startOf, 'day' ) ) &&
					( postDate.isBefore( endOf, 'day' ) || postDate.isSame( endOf, 'day' ) )
				) {
					inPeriod = true;
				}
			}

			return {
				label: item.title,
				value: item.views,
				page: detailPage,
				actions: [ {
					type: 'link',
					data: item.href
				} ],
				labelIcon: null,
				children: null,
				className: inPeriod ? 'published' : null
			};
		} );
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
			return null;
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
	 * @param  {Object} data Stats data
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
	},

	/**
	 * Returns a normalized statsVideo array, ready for use in stats-module
	 *
	 * @param  {Object} payload Stats response payload
	 * @return {Array}          Parsed publicize data array
	 */
	statsVideo( payload ) {
		if ( ! payload || ! payload.data ) {
			return [];
		}

		return payload.data.map( item => {
			return { period: item[ 0 ], value: item[ 1 ] };
		} ).slice( Math.max( payload.data.length - 10, 1 ) );
	},

	/**
	 * Returns a normalized statsTags array, ready for use in stats-module
	 *
	 * @param  {Object} data Stats data
	 * @return {Array}       Parsed publicize data array
	 */
	statsTags( data ) {
		if ( ! data || ! data.tags ) {
			return [];
		}

		const getTagTypeIcon = ( type ) => {
			return type === 'category' ? 'folder' : type;
		};

		return data.tags.map( ( item ) => {
			let children;
			const hasChildren = item.tags.length > 1;
			const labels = item.tags.map( ( tagItem ) => {
				return {
					label: tagItem.name,
					labelIcon: getTagTypeIcon( tagItem.type ),
					link: hasChildren ? null : tagItem.link
				};
			} );

			if ( hasChildren ) {
				children = item.tags.map( ( tagItem ) => {
					return {
						label: tagItem.name,
						labelIcon: getTagTypeIcon( tagItem.type ),
						value: null,
						children: null,
						link: tagItem.link
					};
				} );
			}

			return {
				label: labels,
				link: labels.length > 1 ? null : labels[ 0 ].link,
				value: item.views,
				children: children
			};
		} );
	}
};
