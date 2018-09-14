/** @format */

/**
 * External dependencies
 */

import {
	sortBy,
	toPairs,
	camelCase,
	mapKeys,
	isNumber,
	get,
	filter,
	map,
	concat,
	flatten,
} from 'lodash';
import { moment, translate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { flagUrl } from 'lib/flags';
import { PUBLICIZE_SERVICES_LABEL_ICON } from './constants';

/**
 * Returns a string of the moment format for the period. Supports store stats
 * isoWeek and shortened formats.
 *
 * @param  {String} period Stats query
 * @param  {String} date   Stats date
 * @return {Object}        Period range
 */
export function getPeriodFormat( period, date ) {
	const strDate = date.toString();
	switch ( period ) {
		case 'week':
			return strDate.length === 8 && strDate.substr( 4, 2 ) === '-W' ? 'YYYY-[W]WW' : 'YYYY-MM-DD';
		case 'month':
			return strDate.length === 7 && strDate.substr( 4, 1 ) === '-' ? 'YYYY-MM' : 'YYYY-MM-DD';
		case 'year':
			return strDate.length === 4 ? 'YYYY' : 'YYYY-MM-DD';
		case 'day':
		default:
			return 'YYYY-MM-DD';
	}
}

/**
 * Returns an object with the startOf and endOf dates
 * for the given stats period and date
 *
 * @param  {String} period Stats query
 * @param  {String} date   Stats date
 * @return {Object}        Period range
 */
export function rangeOfPeriod( period, date ) {
	const format = getPeriodFormat( period, date );
	const momentDate = moment( date, format ).locale( 'en' );
	const startOf = momentDate.clone().startOf( period );
	const endOf = momentDate.clone().endOf( period );

	if ( 'week' === period ) {
		if ( '0' === momentDate.format( 'd' ) ) {
			startOf.subtract( 6, 'd' );
			endOf.subtract( 6, 'd' );
		} else {
			startOf.add( 1, 'd' );
			endOf.add( 1, 'd' );
		}
	}
	return {
		startOf: startOf.format( 'YYYY-MM-DD' ),
		endOf: endOf.format( 'YYYY-MM-DD' ),
	};
}

/**
 * Returns true if is auto refreshing astats is allowed
 * for the give stats query
 * It's allowed for queries without dates and for periods including today
 *
 * @param  {String} query  Stats query
 * @return {Boolean}       AutoRefresh allowed or not
 */
export function isAutoRefreshAllowedForQuery( query ) {
	if ( ! query || ! query.date || ( ! query.unit && ! query.period ) ) {
		return true;
	}
	const range = rangeOfPeriod( query.period || query.unit, query.date );
	const today = moment();
	return today >= moment( range.startOf ) && today < moment( range.endOf ).add( 1, 'day' );
}

/**
 * Parse the avatar URL
 * @param  {String} avatarUrl Raw avatar URL
 * @return {String}           Parsed URL
 */
function parseAvatar( avatarUrl ) {
	if ( ! avatarUrl ) {
		return null;
	}
	const [ avatarBaseUrl ] = avatarUrl.split( '?' );
	return avatarBaseUrl + '?d=mm';
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
	const label = parent ? parent + ' > ' + data.label : data.label;
	const escapedLabel = label.replace( /\"/, '""' );
	let exportData = [ [ '"' + escapedLabel + '"', data.value ] ];

	if ( data.children ) {
		const childData = map( data.children, child => {
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
	return JSON.stringify( sortBy( toPairs( query ), pair => pair[ 0 ] ) );
}

/**
 * Return delta data in a format used by 'extensions/woocommerce/app/store-stats`. The fields array is matched to
 * the data in a single object.
 *
 * @param {Object} payload - response
 * @return {array} - Array of data objects
 */
export function parseOrderDeltas( payload ) {
	if (
		! payload ||
		! payload.deltas ||
		! payload.delta_fields ||
		Object.keys( payload.deltas ).length === 0
	) {
		return [];
	}
	return payload.deltas.map( row => {
		// will be renamed to deltas
		const notPeriodKeys = Object.keys( row ).filter( key => key !== 'period' );
		const newRow = { period: parseUnitPeriods( payload.unit, row.period ).format( 'YYYY-MM-DD' ) };
		notPeriodKeys.forEach( key => {
			newRow[ key ] = row[ key ].reduce( ( acc, curr, i ) => {
				acc[ payload.delta_fields[ i ] ] = curr;
				return acc;
			}, {} );
		} );
		return newRow;
	} );
}

/**
 * Create the correct property and value for a label to be used in a chart
 *
 * @param {string} unit - day, week, month, year
 * @param {object} date - moment object
 * @param {object} localizedDate - moment object
 * @return {object}
 */
export function getChartLabels( unit, date, localizedDate ) {
	const validDate = moment.isMoment( date ) && date.isValid();
	const validLocalizedDate = moment.isMoment( localizedDate ) && localizedDate.isValid();

	if ( validDate && validLocalizedDate && unit ) {
		const dayOfWeek = date.toDate().getDay();
		const isWeekend = 'day' === unit && ( 6 === dayOfWeek || 0 === dayOfWeek );
		const labelName = `label${ unit.charAt( 0 ).toUpperCase() + unit.slice( 1 ) }`;
		const formats = {
			day: translate( 'MMM D', {
				context: 'momentjs format string (day)',
				comment: 'This specifies a day for the stats x-axis label.',
			} ),
			week: translate( 'MMM D', {
				context: 'momentjs format string (week)',
				comment: 'This specifies a week for the stats x-axis label.',
			} ),
			month: 'MMM',
			year: 'YYYY',
		};
		return {
			[ labelName ]: localizedDate.format( formats[ unit ] ),
			classNames: isWeekend ? [ 'is-weekend' ] : [],
		};
	}
	return {};
}

/**
 * Return data in a format used by 'components/chart`. The fields array is matched to
 * the data in a single object.
 *
 * @param {Object} payload - response
 * @param {array} nullAttributes - properties on data objects to be initialized with
 * a null value
 * @return {array} - Array of data objects
 */
export function parseOrdersChartData( payload ) {
	if ( ! payload || ! payload.data ) {
		return [];
	}

	return payload.data.map( function( record ) {
		// Initialize data
		const dataRecord = {};

		// Fill Field Values
		record.forEach( function( value, i ) {
			dataRecord[ payload.fields[ i ] ] = value;
		} );

		if ( dataRecord.period ) {
			const date = parseUnitPeriods( payload.unit, dataRecord.period ).locale( 'en' );
			const localizedDate = parseUnitPeriods( payload.unit, dataRecord.period );
			Object.assign( dataRecord, getChartLabels( payload.unit, date, localizedDate ) );
		}

		dataRecord.period = parseUnitPeriods( payload.unit, dataRecord.period ).format( 'YYYY-MM-DD' );
		return dataRecord;
	} );
}

/**
 * Return data in a format used by 'components/chart`. The fields array is matched to
 * the data in a single object.
 *
 * @param {Object} payload - response
 * @param {array} nullAttributes - properties on data objects to be initialized with
 * a null value
 * @return {array} - Array of data objects
 */
function parseChartData( payload, nullAttributes = [] ) {
	if ( ! payload || ! payload.data ) {
		return [];
	}

	return payload.data.map( function( record ) {
		// Initialize data
		const dataRecord = nullAttributes.reduce( ( memo, attribute ) => {
			memo[ attribute ] = null;
			return memo;
		}, {} );

		// Fill Field Values
		record.forEach( function( value, i ) {
			// Remove W from weeks
			if ( 'period' === payload.fields[ i ] ) {
				value = value.replace( /W/g, '-' );
			}
			dataRecord[ payload.fields[ i ] ] = value;
		} );

		if ( dataRecord.period ) {
			const date = moment( dataRecord.period, 'YYYY-MM-DD' ).locale( 'en' );
			const localizedDate = moment( dataRecord.period, 'YYYY-MM-DD' );
			Object.assign( dataRecord, getChartLabels( payload.unit, date, localizedDate ) );
		}
		return dataRecord;
	} );
}

/**
 * Return moment date object for the day or last day of the period.
 *
 * @param {string} unit - day, week, month or year
 * @param {string} period - period in shortened store sting format, eg '2017-W26'
 * @return {Object} - moment date object
 */
export function parseUnitPeriods( unit, period ) {
	switch ( unit ) {
		case 'week':
			const splitYearWeek = period.split( '-W' );
			return moment()
				.isoWeekYear( splitYearWeek[ 0 ] )
				.isoWeek( splitYearWeek[ 1 ] )
				.endOf( 'isoWeek' );
		case 'month':
			return moment( period, 'YYYY-MM' ).endOf( 'month' );
		case 'year':
			return moment( period, 'YYYY' ).endOf( 'year' );
		case 'day':
		default:
			return moment( period, 'YYYY-MM-DD' );
	}
}

export function parseStoreStatsReferrers( payload ) {
	if ( ! payload || ! payload.data || ! payload.fields || ! Array.isArray( payload.data ) ) {
		return [];
	}
	const { fields } = payload;
	return payload.data.map( record => {
		const parsedDate = parseUnitPeriods( payload.unit, record.date ).locale( 'en' );
		const parsedLocalizedDate = parseUnitPeriods( payload.unit, record.date );
		const period = parsedLocalizedDate.format( 'YYYY-MM-DD' );
		return {
			date: period,
			data: record.data.map( referrer => {
				const obj = {};
				referrer.forEach( ( value, i ) => {
					const key = fields[ i ];
					obj[ key ] = value;
				} );
				return obj;
			} ),
			...getChartLabels( payload.unit, parsedDate, parsedLocalizedDate ),
		};
	} );
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
	statsInsights: data => {
		if ( ! data || ! isNumber( data.highest_day_of_week ) ) {
			return {};
		}

		const {
			highest_hour,
			highest_day_percent,
			highest_day_of_week,
			highest_hour_percent,
			hourly_views,
			years,
		} = data;

		// Adjust Day of Week from 0 = Monday to 0 = Sunday (for Moment)
		let dayOfWeek = highest_day_of_week + 1;
		if ( dayOfWeek > 6 ) {
			dayOfWeek = 0;
		}

		return {
			day: moment()
				.day( dayOfWeek )
				.format( 'dddd' ),
			percent: Math.round( highest_day_percent ),
			hour: moment()
				.hour( highest_hour )
				.startOf( 'hour' )
				.format( 'LT' ),
			hourPercent: Math.round( highest_hour_percent ),
			hourlyViews: hourly_views,
			years,
		};
	},

	/**
	 * Returns a normalized payload from `/sites/{ site }/stats/top-posts`
	 *
	 * @param  {Object} data    Stats data
	 * @param  {Object} query   Stats query
	 * @param  {Int}    siteId  Site ID
	 * @param  {Obejct} site    Site object
	 * @return {Object?}        Normalized stats data
	 */
	statsTopPosts: ( data, query, siteId, site ) => {
		if ( ! data || ! query.period || ! query.date ) {
			return [];
		}

		const { startOf, endOf } = rangeOfPeriod( query.period, query.date );
		const dataPath = query.summarize
			? [ 'summary', 'postviews' ]
			: [ 'days', startOf, 'postviews' ];
		const viewData = get( data, dataPath, [] );

		return map( viewData, item => {
			const detailPage = site ? `/stats/post/${ item.id }/${ site.slug }` : null;
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
				actions: [
					{
						type: 'link',
						data: item.href,
					},
				],
				labelIcon: null,
				children: null,
				className: inPeriod ? 'published' : null,
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
		const countryData = filter( get( data, dataPath, [] ), viewData => {
			return countryInfo[ viewData.country_code ];
		} );

		return map( countryData, viewData => {
			const country = countryInfo[ viewData.country_code ];
			const icon = flagUrl( viewData.country_code.toLowerCase() );

			// ’ in country names causes google's geo viz to break
			return {
				label: country.country_full.replace( /’/, "'" ),
				countryCode: viewData.country_code,
				value: viewData.views,
				region: country.map_region,
				backgroundImage: icon,
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

		return data.services.map( service => {
			const { label, icon } = PUBLICIZE_SERVICES_LABEL_ICON[ service.service ];
			return { label, icon, value: service.followers };
		} );
	},

	/**
	 * Returns a normalized statsVideoPlays array, ready for use in stats-module
	 *
	 * @param  {Object} data    Stats data
	 * @param  {Object} query   Stats query
	 * @param  {Int}    siteId  Site ID
	 * @param  {Obejct} site    Site object
	 * @return {Array}          Normalized stats data
	 */
	statsVideoPlays( data, query = {}, siteId, site ) {
		if ( ! data || ! query.period || ! query.date ) {
			return [];
		}
		const { startOf } = rangeOfPeriod( query.period, query.date );
		const videoPlaysData = get( data, [ 'days', startOf, 'plays' ], [] );

		return videoPlaysData.map( item => {
			const detailPage = site
				? `/stats/${ query.period }/videodetails/${ site.slug }?post=${ item.post_id }`
				: null;
			return {
				label: item.title,
				page: detailPage,
				value: item.plays,
				actions: [
					{
						type: 'link',
						data: item.url,
					},
				],
			};
		} );
	},

	/**
	 * Returns a normalized statsFollowers object
	 *
	 * @param  {Object} data    Stats data
	 * @return {?Object}         Normalized stats data
	 */
	statsFollowers( data ) {
		if ( ! data ) {
			return null;
		}
		const { total_wpcom, total_email } = data;
		const subscriberData = get( data, [ 'subscribers' ], [] );

		const subscribers = subscriberData.map( item => {
			return {
				label: item.label,
				iconClassName: 'avatar-user',
				icon: parseAvatar( item.avatar ),
				link: item.url,
				value: {
					type: 'relative-date',
					value: item.date_subscribed,
				},
				actions: [
					{
						type: 'follow',
						data: item.follow_data ? item.follow_data.params : false,
					},
				],
			};
		} );

		return { total_wpcom, total_email, subscribers };
	},

	statsCommentFollowers( data ) {
		if ( ! data ) {
			return null;
		}

		const page = data.page || 0;
		const pages = data.pages || 0;
		const total = data.total || 0;
		let posts = [];
		if ( data.posts ) {
			posts = data.posts.map( item => {
				if ( 0 === item.id ) {
					return {
						label: 'All Posts',
						value: item.followers,
					};
				}
				return {
					label: item.title,
					link: item.url,
					labelIcon: 'external',
					value: item.followers,
				};
			} );
		}

		return { page, pages, total, posts };
	},

	statsComments( data, query, siteId, site ) {
		if ( ! data ) {
			return null;
		}
		const adminUrl = site ? site.options.admin_url : null;

		let authors = [];
		if ( data.authors ) {
			authors = data.authors.map( author => {
				return {
					label: author.name,
					value: author.comments,
					iconClassName: 'avatar-user',
					icon: parseAvatar( author.gravatar ),
					link: adminUrl + 'edit-comments.php' + author.link,
					className: 'module-content-list-item-large',
					actions: [
						{
							type: 'follow',
							data: author.follow_data ? author.follow_data.params : false,
						},
					],
				};
			} );
		}

		let posts = [];
		if ( data.posts ) {
			posts = data.posts.map( post => {
				return {
					label: post.name,
					value: post.comments,
					page: site ? '/stats/post/' + post.id + '/' + site.slug : null,
					actions: [
						{
							type: 'link',
							data: post.link,
						},
					],
				};
			} );
		}

		return { authors, posts };
	},

	/**
	 * Returns a normalized statsVideo array, ready for use in stats-module
	 *
	 * @param  {Object} payload Stats response payload
	 * @return {Array}          Parsed data array
	 */
	statsVideo( payload ) {
		if ( ! payload ) {
			return null;
		}

		let data = [];
		if ( payload.data ) {
			data = payload.data
				.map( item => {
					return { period: item[ 0 ], value: item[ 1 ] };
				} )
				.slice( Math.max( payload.data.length - 10, 1 ) );
		}

		let pages = [];
		if ( payload.pages ) {
			pages = payload.pages.map( item => {
				return {
					label: item,
					link: item,
				};
			} );
		}

		return { pages, data };
	},

	/**
	 * Returns a normalized statsTopAuthors array, ready for use in stats-module
	 *
	 * @param  {Object} data   Stats data
	 * @param  {Object} query  Stats query
	 * @param  {Int}    siteId Site ID
	 * @param  {Object} site   Site Object
	 * @return {Array}       Normalized stats data
	 */
	statsTopAuthors( data, query = {}, siteId, site ) {
		if ( ! data || ! query.period || ! query.date ) {
			return [];
		}
		const { startOf } = rangeOfPeriod( query.period, query.date );
		const authorsData = get( data, [ 'days', startOf, 'authors' ], [] );

		return authorsData.map( item => {
			const record = {
				label: item.name,
				iconClassName: 'avatar-user',
				icon: parseAvatar( item.avatar ),
				children: null,
				value: item.views,
				className: 'module-content-list-item-large',
			};

			if ( item.posts && item.posts.length > 0 ) {
				record.children = item.posts.map( child => {
					return {
						label: child.title,
						value: child.views,
						page: site ? '/stats/post/' + child.id + '/' + site.slug : null,
						actions: [
							{
								type: 'link',
								data: child.url,
							},
						],
						children: null,
					};
				} );
			}

			return record;
		} );
	},

	/**
	 * Returns a normalized statsTags array, ready for use in stats-module
	 *
	 * @param  {Object} data Stats data
	 * @return {Array}       Parsed data array
	 */
	statsTags( data ) {
		if ( ! data || ! data.tags ) {
			return [];
		}

		const getTagTypeIcon = type => {
			return type === 'category' ? 'folder' : type;
		};

		return data.tags.map( item => {
			let children;
			const hasChildren = item.tags.length > 1;
			const labels = item.tags.map( tagItem => {
				return {
					label: tagItem.name,
					labelIcon: getTagTypeIcon( tagItem.type ),
					link: hasChildren ? null : tagItem.link,
				};
			} );

			if ( hasChildren ) {
				children = item.tags.map( tagItem => {
					return {
						label: tagItem.name,
						labelIcon: getTagTypeIcon( tagItem.type ),
						value: null,
						children: null,
						link: tagItem.link,
					};
				} );
			}

			return {
				label: labels,
				link: labels.length > 1 ? null : labels[ 0 ].link,
				value: item.views,
				children: children,
			};
		} );
	},

	/*
	 * Returns a normalized statsClicks array, ready for use in stats-module
	 *
	 * @param  {Object} data   Stats data
	 * @param  {Object} query  Stats query
	 * @return {Array}        Parsed data array
	 */
	statsClicks( data, query ) {
		if ( ! data || ! query.period || ! query.date ) {
			return [];
		}

		const { startOf } = rangeOfPeriod( query.period, query.date );
		const dataPath = query.summarize ? [ 'summary', 'clicks' ] : [ 'days', startOf, 'clicks' ];
		const statsData = get( data, dataPath, [] );

		return statsData.map( item => {
			const hasChildren = item.children && item.children.length > 0;
			const newRecord = {
				label: item.name,
				value: item.views,
				children: null,
				link: item.url,
				icon: item.icon,
				labelIcon: hasChildren ? null : 'external',
			};

			if ( item.children ) {
				newRecord.children = item.children.map( child => {
					return {
						label: child.name,
						value: child.views,
						children: null,
						link: child.url,
						labelIcon: 'external',
					};
				} );
			}

			return newRecord;
		} );
	},

	/*
	 * Returns a normalized statsReferrers array, ready for use in stats-module
	 *
	 * @param  {Object} data   Stats data
	 * @param  {Object} query  Stats query
	 * @param  {Int}    siteId Site ID
	 * @return {Array}         Parsed data array
	 */
	statsReferrers( data, query, siteId ) {
		if ( ! data || ! query.period || ! query.date ) {
			return [];
		}

		const { startOf } = rangeOfPeriod( query.period, query.date );
		const dataPath = query.summarize ? [ 'summary', 'groups' ] : [ 'days', startOf, 'groups' ];
		const statsData = get( data, dataPath, [] );

		const parseItem = item => {
			let children;
			if ( item.children && item.children.length > 0 ) {
				children = item.children.map( parseItem );
			}

			const record = {
				label: item.name,
				value: item.views,
				link: item.url,
				labelIcon: children ? null : 'external',
				children,
			};

			if ( item.icon ) {
				record.icon = item.icon;
			}

			return record;
		};

		return statsData.map( item => {
			let actions = [];
			if (
				( item.url && -1 !== item.url.indexOf( item.name ) ) ||
				( ! item.url && item.name === item.group && -1 !== item.name.indexOf( '.' ) )
			) {
				actions = [
					{
						type: 'spam',
						data: {
							siteID: siteId,
							domain: item.name,
						},
					},
				];
			}

			return {
				...parseItem( { ...item, children: item.results, views: item.total } ),
				actions,
				actionMenu: actions.length,
			};
		} );
	},

	statsVisits( payload ) {
		return parseChartData( payload, [ 'visits', 'likes', 'visitors', 'comments', 'posts' ] );
	},

	statsOrders( payload ) {
		return {
			data: parseOrdersChartData( payload ),
			deltas: parseOrderDeltas( payload ),
		};
	},

	statsStoreReferrers( payload ) {
		return parseStoreStatsReferrers( payload );
	},

	statsTopSellers( payload ) {
		if ( ! payload || ! payload.data ) {
			return [];
		}
		return payload.data;
	},

	statsTopCategories( payload ) {
		if ( ! payload || ! payload.data ) {
			return [];
		}
		return payload.data;
	},

	statsTopCoupons( payload ) {
		if ( ! payload || ! payload.data ) {
			return [];
		}
		return payload.data;
	},

	statsTopEarners( payload ) {
		if ( ! payload || ! payload.data ) {
			return [];
		}
		return payload.data;
	},

	/*
	 * Returns a normalized statsSearchTerms array, ready for use in stats-module
	 *
	 * @param  {Object} data   Stats data
	 * @param  {Object} query  Stats query
	 * @return {Array}         Parsed data array
	 */
	statsSearchTerms( data, query ) {
		if ( ! data || ! query.period || ! query.date ) {
			return [];
		}

		const { startOf } = rangeOfPeriod( query.period, query.date );
		const dataPath = query.summarize ? [ 'summary' ] : [ 'days', startOf ];
		const searchTerms = get( data, dataPath.concat( [ 'search_terms' ] ), [] );
		const encryptedSearchTerms = get(
			data,
			dataPath.concat( [ 'encrypted_search_terms' ] ),
			false
		);

		const result = searchTerms.map( day => {
			return {
				label: day.term,
				className: 'user-selectable',
				value: day.views,
			};
		} );

		if ( encryptedSearchTerms ) {
			result.push( {
				label: translate( 'Unknown Search Terms' ),
				value: encryptedSearchTerms,
				link: 'http://en.support.wordpress.com/stats/#search-engine-terms',
				labelIcon: 'external',
			} );
		}

		return result;
	},

	/*
	 * Returns a normalized statsPodcastDownloads array, ready for use in stats-module
	 *
	 * @param  {Object} data   Stats data
	 * @param  {Object} query  Stats query
	 * @param  {Int}    siteId Site ID
	 * @param  {Object} site   Site Object
	 * @return {Array}         Parsed data array
	 */
	statsPodcastDownloads( data, query, siteId, site ) {
		if ( ! data || ! query.period || ! query.date ) {
			return [];
		}

		const { startOf } = rangeOfPeriod( query.period, query.date );
		const statsData = get( data, [ 'days', startOf, 'downloads' ], [] );

		return statsData.map( item => {
			const detailPage = site
				? '/stats/' + query.period + '/podcastdownloads/' + site.slug + '?post=' + item.post_id
				: null;
			return {
				label: item.title,
				page: detailPage,
				value: item.downloads,
				actions: [
					{
						type: 'link',
						data: item.url,
					},
				],
			};
		} );
	},
};
