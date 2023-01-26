import { getLocaleSlug, translate } from 'i18n-calypso';
import moment from 'moment';
import { getChartLabels } from 'calypso/state/stats/lists/utils';

export function rangeOfPeriod( period, date ) {
	const periodRange = {
		period: period,
		startOf: date.clone().startOf( period ),
		endOf: date.clone().endOf( period ),
	};

	if ( 'week' === period ) {
		if ( '0' === date.format( 'd' ) ) {
			periodRange.startOf.subtract( 6, 'd' );
			periodRange.endOf.subtract( 6, 'd' );
		} else {
			periodRange.startOf.add( 1, 'd' );
			periodRange.endOf.add( 1, 'd' );
		}
	}

	periodRange.key = period + ':' + periodRange.endOf.format( 'YYYY-MM-DD' );

	return periodRange;
}

export function getPeriodWithFallback( period, date, isValidStartDate, fallbackDate ) {
	if ( ! isValidStartDate && fallbackDate ) {
		const fallbackDateMoment = moment( fallbackDate ).locale( 'en' );
		const postPeriod = rangeOfPeriod( period.period, fallbackDateMoment );
		return { period: postPeriod, date: postPeriod.startOf, hasValidDate: true };
	} else if ( ! isValidStartDate && ! fallbackDate ) {
		return { period: period, date: date, hasValidDate: false };
	}

	return { period, date, hasValidDate: true };
}

export function getCharts( statType ) {
	const charts = {
		opens: [
			{
				attr: 'opens_count',
				legendOptions: [],
				icon: (
					<svg
						className="gridicon"
						width="24"
						height="24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="m4 13 .67.336.003-.005a2.42 2.42 0 0 1 .094-.17c.071-.122.18-.302.329-.52.298-.435.749-1.017 1.359-1.598C7.673 9.883 9.498 8.75 12 8.75s4.326 1.132 5.545 2.293c.61.581 1.061 1.163 1.36 1.599a8.29 8.29 0 0 1 .422.689l.002.005L20 13l.67-.336v-.003l-.003-.005-.008-.015-.028-.052a9.752 9.752 0 0 0-.489-.794 11.6 11.6 0 0 0-1.562-1.838C17.174 8.617 14.998 7.25 12 7.25S6.827 8.618 5.42 9.957c-.702.669-1.22 1.337-1.563 1.839a9.77 9.77 0 0 0-.516.845l-.008.015-.002.005-.001.002v.001L4 13Zm8 3a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
							fill="#00101C"
						/>
					</svg>
				),
				label: translate( 'Opens', { context: 'noun' } ),
			},
		],
		clicks: [
			{
				attr: 'clicks',
				legendOptions: [],
				icon: (
					<svg
						className="gridicon"
						width="24"
						height="24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							fillRule="evenodd"
							clipRule="evenodd"
							d="m4 13 .67.336.003-.005a2.42 2.42 0 0 1 .094-.17c.071-.122.18-.302.329-.52.298-.435.749-1.017 1.359-1.598C7.673 9.883 9.498 8.75 12 8.75s4.326 1.132 5.545 2.293c.61.581 1.061 1.163 1.36 1.599a8.29 8.29 0 0 1 .422.689l.002.005L20 13l.67-.336v-.003l-.003-.005-.008-.015-.028-.052a9.752 9.752 0 0 0-.489-.794 11.6 11.6 0 0 0-1.562-1.838C17.174 8.617 14.998 7.25 12 7.25S6.827 8.618 5.42 9.957c-.702.669-1.22 1.337-1.563 1.839a9.77 9.77 0 0 0-.516.845l-.008.015-.002.005-.001.002v.001L4 13Zm8 3a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
							fill="#00101C"
						/>
					</svg>
				),
				label: translate( 'Clicks', { context: 'noun' } ),
			},
		],
	};

	return charts[ statType ];
}

/**
 * Return data in a format used by 'components/chart` for email stats. The fields array is matched to
 * the data in a single object.
 *
 * @param {Object} payload - response
 * @param {Array} nullAttributes - properties on data objects to be initialized with
 * a null value
 * @returns {Array} - Array of data objects
 */
export function parseEmailChartData( payload, nullAttributes = [] ) {
	if ( ! payload || ! payload.data ) {
		return [];
	}

	if ( 'hour' === payload.unit ) {
		payload.fields.push( 'hour' );
	}

	return payload.data.map( function ( record ) {
		// Initialize data
		const dataRecord = nullAttributes.reduce( ( memo, attribute ) => {
			memo[ attribute ] = null;
			return memo;
		}, {} );

		// Fill Field Values
		record.forEach( function ( value, i ) {
			// Remove W from weeks
			if ( 'date' === payload.fields[ i ] ) {
				value = value.replace( /W/g, '-' );
				dataRecord.period = value;
			} else {
				dataRecord[ payload.fields[ i ] ] = value;
			}
		} );

		if ( dataRecord.period ) {
			const date = moment( dataRecord.period, 'YYYY-MM-DD' ).locale( 'en' );
			const localeSlug = getLocaleSlug();
			const localizedDate = moment( dataRecord.period, 'YYYY-MM-DD' ).locale( localeSlug );
			if ( dataRecord.hour ) {
				localizedDate.add( dataRecord.hour, 'hours' );
			}
			Object.assign( dataRecord, getChartLabels( payload.unit, date, localizedDate ) );
		}
		return dataRecord;
	} );
}

/**
 * Return data in a format used by 'components/stats/geochart` for email stats. The fields array is matched to
 * the data in a single object.
 *
 * @param {Array} countries - the array of countries for the given data
 * @param {Object} countriesInfo - an object containing information about the countries
 * @returns {Array} - Array of data objects
 */
export function parseEmailCountriesData( countries, countriesInfo ) {
	if ( ! countries || ! countriesInfo ) {
		return null;
	}

	const result = countries
		.map( function ( country ) {
			const info = countriesInfo[ country[ 0 ] ];
			if ( ! info ) {
				return {
					label: translate( 'Unknown' ),
					value: parseInt( country[ 1 ], 10 ),
				};
			}

			const { country_full, map_region } = info;

			return {
				countryCode: country[ 0 ],
				label: country_full,
				region: map_region,
				value: parseInt( country[ 1 ], 10 ),
			};
		} )
		.sort( ( a, b ) => b.value - a.value );

	// Add item with label == Other to end of the list
	const otherItem = result.find( ( item ) => item.label === translate( 'Unknown' ) );
	if ( otherItem ) {
		result.splice( result.indexOf( otherItem ), 1 );
		result.push( otherItem );
	}

	return result;
}

/**
 * Return data in a format used by lists for email stats. The fields array is matched to
 * the data in a single object.
 *
 * @param {Array} list - the array of devices/clients for the given data
 * @returns {Array} - Array of data objects
 */
export function parseEmailListData( list ) {
	if ( ! list ) {
		return null;
	}

	const result = list
		.map( function ( item ) {
			return {
				label: item[ 0 ],
				value: parseInt( item[ 1 ], 10 ),
			};
		} )
		.sort( function ( a, b ) {
			return b.value - a.value;
		} );

	// Add item with label == Other to end of the list
	const otherItem = result.find( ( item ) => item.label === 'Other' );
	if ( otherItem ) {
		result.splice( result.indexOf( otherItem ), 1 );
		result.push( otherItem );
	}
	return result;
}

/**
 * Return link data in a format used by lists for email stats. The fields array is matched to
 * the data in a single object.
 *
 * @param {Array} links - the array of links for the given data
 * @returns {Array|null} - Array of data objects
 */
export function parseEmailLinksData( links ) {
	if ( ! links ) {
		return null;
	}

	const stringMap = {
		'post-url': translate( 'Post URL', { context: 'Email link type' } ),
		'like-post': translate( 'Like', { context: 'Email link type' } ),
		'comment-post': translate( 'Comment', { context: 'Email link type' } ),
		'remove-subscription': translate( 'Unsubscribe', { context: 'Email link type' } ),
	};

	// filter out links that are not in the stringMap
	const filteredLinks = links
		.filter( ( link ) => stringMap[ link[ 0 ] ] )
		.sort( ( a, b ) => b[ 1 ] - a[ 1 ] );
	// Get count of all links where the first element is not a key of stringMap
	const otherCount = links.reduce( ( count, link ) => {
		if ( ! stringMap[ link[ 0 ] ] ) {
			count += parseInt( link[ 1 ], 10 );
		}
		return count;
	}, 0 );

	return [
		...filteredLinks.map( ( link ) => {
			return {
				label: stringMap[ link[ 0 ] ],
				value: parseInt( link[ 1 ], 10 ),
			};
		} ),
		otherCount
			? {
					label: translate( 'Other', { context: 'Email link type' } ),
					value: otherCount,
			  }
			: null,
	];
}
