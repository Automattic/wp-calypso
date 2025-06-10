import { translate, getLocaleSlug } from 'i18n-calypso';
import { sortBy, camelCase, get, filter, map, flatten, capitalize } from 'lodash';
import moment from 'moment';
import { PUBLICIZE_SERVICES_LABEL_ICON } from './constants';

function getArchiveKeyLabel( key ) {
	const archiveKeyLabelMap = {
		author: translate( 'Authors' ),
		cat: translate( 'Categories' ),
		err: translate( 'Error' ),
		home: translate( 'Homepage' ),
		search: translate( 'Searches' ),
		tag: translate( 'Tags' ),
		tax: translate( 'Taxonomies' ),
		date: translate( 'Dates' ),
		multiple: translate( 'Aggregated' ),
		other: translate( 'Others' ),
	};

	return archiveKeyLabelMap[ key ] ?? capitalize( key );
}

/**
 * Returns a string of the moment format for the period. Supports store stats
 * isoWeek and shortened formats.
 * @param   {string} period Stats query
 * @param   {string} date   Stats date
 * @returns {Object}        Period range
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
 * @param   {string} period Stats query
 * @param   {string} date   Stats date
 * @returns {Object}        Period range
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
 * @param   {string} query  Stats query
 * @returns {boolean}       AutoRefresh allowed or not
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
 * @param   {string} avatarUrl Raw avatar URL
 * @returns {string}           Parsed URL
 */
export function parseAvatar( avatarUrl ) {
	if ( ! avatarUrl ) {
		return null;
	}
	const [ avatarBaseUrl ] = avatarUrl.split( '?' );
	return avatarBaseUrl + '?d=mm';
}

/**
 * Builds data into escaped array for CSV export
 * @param   {Object} data                                               Normalized stats data object
 * @param   {string} parent                                             Label of parent
 * @param   {(value: unknown[], data?: Object) => unknown[]} modifierFn Modifies the export row.
 * @returns {Array}                                                     CSV Row
 */
export function buildExportArray( data, parent = null, modifierFn = null ) {
	if ( ! data || ! data.label || ! data.value ) {
		return [];
	}
	const label = parent ? parent + ' > ' + String( data.label ) : String( data.label );
	// eslint-disable-next-line
	const escapedLabel = label.replace( /\"/, '""' );
	let exportData = [ [ '"' + escapedLabel + '"', data.value ] ];

	// Includes the URL for content data, but not for "Countries" data where it doesn't exist.
	if ( data.actions && data.actions.length ) {
		exportData = [ [ '"' + escapedLabel + '"', data.value, data.actions[ 0 ].data ] ];
	}

	if ( modifierFn ) {
		exportData = [ modifierFn( exportData[ 0 ], data ) ];
	}

	if ( data.children ) {
		const childData = map( data.children, ( child ) => {
			return buildExportArray( child, label, modifierFn );
		} );

		exportData = exportData.concat( flatten( childData ) );
	}

	return exportData;
}

/**
 * Returns a serialized stats query, used as the key in the
 * `state.stats.lists.items` and `state.stats.lists.requesting` state objects.
 * @param   {Object} query    Stats query
 * @returns {string}          Serialized stats query
 */
export function getSerializedStatsQuery( query = {} ) {
	return JSON.stringify( sortBy( Object.entries( query ), ( pair ) => pair[ 0 ] ) );
}

/**
 * Return delta data in a format used by 'extensions/woocommerce/app/store-stats`. The fields array is matched to
 * the data in a single object.
 * @param   {Object} payload - response
 * @returns {Array} - Array of data objects
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
	return payload.deltas.map( ( row ) => {
		// will be renamed to deltas
		const notPeriodKeys = Object.keys( row ).filter( ( key ) => key !== 'period' );
		const newRow = { period: parseUnitPeriods( payload.unit, row.period ).format( 'YYYY-MM-DD' ) };
		notPeriodKeys.forEach( ( key ) => {
			newRow[ key ] = row[ key ].reduce( ( acc, curr, i ) => {
				acc[ payload.delta_fields[ i ] ] = curr;
				return acc;
			}, {} );
		} );
		return newRow;
	} );
}

export const chartLabelformats = {
	// This specifies an hour for the stats x-axis label.
	hour: 'HH:mm',
	// This specifies a day for the stats x-axis label.
	day: 'MMM D',
	// This specifies a week for the stats x-axis label.
	week: 'MMM D',
	month: 'MMM',
	year: 'YYYY',
};

/**
 * Create the correct property and value for a label to be used in a chart
 * @param {string} unit - day, week, month, year
 * @param {Object} date - moment object
 * @param {Object} localizedDate - moment object
 * @returns {Object} chart labels
 */
export function getChartLabels( unit, date, localizedDate ) {
	const validDate = moment.isMoment( date ) && date.isValid();
	const validLocalizedDate = moment.isMoment( localizedDate ) && localizedDate.isValid();

	if ( validDate && validLocalizedDate && unit ) {
		const dayOfWeek = date.toDate().getDay();
		const isWeekend = 'day' === unit && ( 6 === dayOfWeek || 0 === dayOfWeek );
		const labelName = `label${ unit.charAt( 0 ).toUpperCase() + unit.slice( 1 ) }`;
		return {
			[ labelName ]: localizedDate.format( chartLabelformats[ unit ] ),
			classNames: isWeekend ? [ 'is-weekend' ] : [],
		};
	}
	return {};
}

/**
 * Return data in a format used by 'components/chart`. The fields array is matched to
 * the data in a single object.
 * @param {Object} payload - response
 * @returns {Array} - Array of data objects
 */
export function parseOrdersChartData( payload ) {
	if ( ! payload || ! payload.data ) {
		return [];
	}

	return payload.data.map( function ( record ) {
		// Initialize data
		const dataRecord = {};

		// Fill Field Values
		record.forEach( function ( value, i ) {
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
 * @param {Object} payload - response
 * @param {Array} nullAttributes - properties on data objects to be initialized with
 * a null value
 * @returns {Array} - Array of data objects
 */
export function parseChartData( payload, nullAttributes = [] ) {
	if ( ! payload || ! payload.data ) {
		return [];
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
			if ( 'period' === payload.fields[ i ] ) {
				value = value.replace( /W/g, '-' );
			}
			dataRecord[ payload.fields[ i ] ] = value;
		} );

		if ( dataRecord.period ) {
			const date = moment( dataRecord.period, 'YYYY-MM-DD' ).locale( 'en' );
			const localeSlug = getLocaleSlug();
			// The period could be a full time format.
			const localizedDate = moment( dataRecord.period, 'YYYY-MM-DD HH:mm:ss' ).locale( localeSlug );
			Object.assign( dataRecord, getChartLabels( payload.unit, date, localizedDate ) );
		}
		return dataRecord;
	} );
}

/**
 * Return moment date object for the day or last day of the period.
 * @param {string} unit - day, week, month or year
 * @param {string} period - period in shortened store sting format, eg '2017-W26'
 * @returns {Object} - moment date object
 */
export function parseUnitPeriods( unit, period ) {
	let splitYearWeek;
	const localeSlug = getLocaleSlug();

	switch ( unit ) {
		case 'week':
			splitYearWeek = period.split( '-W' );
			return moment()
				.locale( localeSlug )
				.isoWeekYear( splitYearWeek[ 0 ] )
				.isoWeek( splitYearWeek[ 1 ] )
				.endOf( 'isoWeek' );
		case 'month':
			return moment( period, 'YYYY-MM' ).locale( localeSlug ).endOf( 'month' );
		case 'year':
			return moment( period, 'YYYY' ).locale( localeSlug ).endOf( 'year' );
		case 'day':
		default:
			return moment( period, 'YYYY-MM-DD' ).locale( localeSlug );
	}
}

export const normalizers = {
	/**
	 * Returns a normalized payload from `/sites/{ site }/stats`
	 * @param   {Object} data    Stats data
	 * @returns {Object | null}        Normalized stats data
	 */
	stats( data ) {
		if ( ! data || ! data.stats ) {
			return null;
		}

		return Object.fromEntries(
			Object.entries( data.stats ).map( ( [ key, value ] ) => [ camelCase( key ), value ] )
		);
	},

	/**
	 * Returns a normalized payload from `/sites/{ site }/stats/insights`
	 * @param   {Object} data    Stats query
	 * @returns {Object | null}        Normalized stats data
	 */
	statsInsights: ( data ) => {
		if ( ! data || typeof data.highest_day_of_week !== 'number' ) {
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

		const localeSlug = getLocaleSlug();

		return {
			day: moment().locale( localeSlug ).day( dayOfWeek ).format( 'dddd' ),
			percent: Math.round( highest_day_percent ),
			hour: moment().locale( localeSlug ).hour( highest_hour ).startOf( 'hour' ).format( 'LT' ),
			hourPercent: Math.round( highest_hour_percent ),
			hourlyViews: hourly_views,
			years,
		};
	},

	/**
	 * Returns a normalized payload from `/sites/{ site }/stats/top-posts`
	 * @param   {Object} data    Stats data
	 * @param   {Object} query   Stats query
	 * @param   {number} siteId  Site ID
	 * @param   {Object} site    Site object
	 * @returns {Object | null}        Normalized stats data
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

		return map( viewData, ( item ) => {
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
				id: item.id,
				label: item.title,
				value: item.views,
				page: detailPage,
				public: item.public,
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
	 * Returns a normalized payload from `/sites/{ site }/stats/archives`
	 * @param   {Object} data    Stats data
	 * @param   {Object} query   Stats query
	 * @returns {Array}          Normalized stats data
	 */
	statsArchives: ( data, query ) => {
		if ( ! data || ! query.period || ! query.date ) {
			return [];
		}

		const { startOf } = rangeOfPeriod( query.period, query.date );
		const dataPath = query.summarize ? [ 'summary' ] : [ 'days', startOf ];
		const archivesData = get( data, dataPath, [] );

		const archives = Object.keys( archivesData ).reduce( ( accumulatedArchives, archiveKey ) => {
			const archiveItems = archivesData[ archiveKey ];

			// Taxonomy items are grouped by taxonomy term.
			if ( 'tax' === archiveKey ) {
				let totalTaxViews = 0;

				const taxItems = Object.keys( archiveItems ).map( ( taxKey ) => {
					const taxItem = archiveItems[ taxKey ];
					const hasSubItems = Array.isArray( taxItem ) && taxItem.length > 0;
					let itemViews = 0;

					if ( hasSubItems ) {
						const children = taxItem.map( ( item ) => {
							itemViews += item.views;
							totalTaxViews += item.views;

							return {
								label: item.value,
								value: item.views,
								link: item.href,
							};
						} );

						return {
							label: taxKey,
							value: itemViews,
							children,
						};
					}

					return {
						label: taxKey,
						value: itemViews,
					};
				} );

				accumulatedArchives.push( {
					label: getArchiveKeyLabel( archiveKey ),
					value: totalTaxViews,
					children: taxItems,
				} );
			} else {
				const hasItems = Array.isArray( archiveItems ) && archiveItems.length > 0;

				if ( hasItems ) {
					let totalViews = 0;

					const children = archiveItems.map( ( item ) => {
						totalViews += item.views;

						return {
							label: [ 'home', 'search' ].includes( archiveKey ) ? item.href : item.value,
							value: item.views,
							link: item.href,
						};
					} );

					accumulatedArchives.push( {
						label: getArchiveKeyLabel( archiveKey ),
						value: totalViews,
						children,
					} );
				}
			}

			return accumulatedArchives;
		}, [] );

		return archives.sort( ( a, b ) => b.value - a.value );
	},

	/**
	 * Returns a normalized payload from `/sites/{ site }/stats/country-views`
	 * @param   {Object} data    Stats data
	 * @param   {Object} query   Stats query
	 * @returns {Object | null}        Normalized stats data
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
			// Ignore the unknown location of sources from the legacy stats geoviews table.
			if ( [ 'A1', 'A2', 'ZZ' ].includes( viewData.country_code ) ) {
				return false;
			}

			// TODO: Investigate ignored countries that have `false` as the country_full data.
			if (
				countryInfo[ viewData.country_code ] &&
				! countryInfo[ viewData.country_code ].country_full
			) {
				return false;
			}

			return countryInfo[ viewData.country_code ];
		} );

		return map( countryData, ( viewData ) => {
			const country = countryInfo[ viewData.country_code ];

			// ’ in country names causes google's geo viz to break
			return {
				label: viewData.location || country.country_full.replace( /’/, "'" ),
				countryCode: viewData.country_code,
				countryFull: country.country_full,
				value: viewData.views,
				region: country.map_region,
				...( viewData.coordinates && { coordinates: viewData.coordinates } ),
			};
		} );
	},

	/**
	 * Returns a normalized statsPublicize array, ready for use in stats-module
	 * @param   {Object} data Stats data
	 * @returns {Array}       Parsed publicize data array
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
	 * Returns a normalized data for the `stats/video-plays` API request with `complete_stats` query param set to `1`
	 * This returns more enriched data about the video plays, including impressions, watch time, and retention rate.
	 * @param   {Object} data    Stats data
	 * @param   {Object} query   Stats query
	 * @returns {Array}          Parsed data array
	 */
	statsVideoPlaysCompleteStats: ( data, query = {} ) => {
		if ( ! data || ! query.period || ! query.date ) {
			return [];
		}

		const { startOf } = rangeOfPeriod( query.period, query.date );
		const videoPlaysData = get(
			data,
			query.summarize ? [ 'days', 'summary', 'data' ] : [ 'days', startOf, 'data' ],
			[]
		);

		const normalizedData = videoPlaysData.map( ( item ) => {
			return {
				post_id: item.post_id,
				label: item.title,
				views: item.views,
				impressions: item.impressions,
				watch_time: item.watch_time,
				retention_rate: item.retention_rate,
			};
		} );

		return [
			[ 'post_id', 'title', 'views', 'impressions', 'watch_time', 'retention_rate' ],
			...normalizedData,
		];
	},

	/**
	 * Returns a normalized statsVideoPlays array, ready for use in stats-module
	 * @param   {Object} data    Stats data
	 * @param   {Object} query   Stats query
	 * @param   {number} siteId  Site ID
	 * @param   {Object} site    Site object
	 * @returns {Array}          Normalized stats data
	 */
	statsVideoPlays( data, query = {}, siteId, site ) {
		if ( ! data || ! query.period || ! query.date ) {
			return [];
		}
		const { startOf } = rangeOfPeriod( query.period, query.date );
		const isCompleteStats = query.complete_stats;

		if ( isCompleteStats ) {
			return normalizers.statsVideoPlaysCompleteStats( data, query, siteId, site );
		}

		const videoPlaysData = get(
			data,
			query.summarize ? [ 'days', 'summary', 'plays' ] : [ 'days', startOf, 'plays' ],
			[]
		);

		return videoPlaysData.map( ( item ) => {
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
	 * @param   {Object} data    Stats data
	 * @returns {?Object}         Normalized stats data
	 */
	statsFollowers( data ) {
		if ( ! data ) {
			return null;
		}
		const { total_wpcom, total_email, total } = data;
		const subscriberData = get( data, [ 'subscribers' ], [] );

		const subscribers = subscriberData.map( ( item ) => {
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

		return { total_wpcom, total_email, total, subscribers };
	},

	statsUTM( originalData ) {
		if ( ! Array.isArray( originalData ) ) {
			return [];
		}

		const newData = [];

		// Flatten the data into a shallow array.
		originalData.forEach( ( row ) => {
			newData.push( row );
			const children = row?.children;
			if ( children ) {
				const newChildren = children.map( ( child ) => {
					return { ...child, context: row.label };
				} );
				newData.push( ...newChildren );
			}
		} );

		return newData.map( ( row ) => {
			// Label should include parent context if present.
			// ie: "parent label > child label" -- including surrounding quotes.
			let label = row?.context ? `${ row.context } > ${ row.label }` : row.label;
			label = label.replace( /"/g, '""' ); // Escape double quotes

			return {
				label,
				value: row.value,
			};
		} );
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
			posts = data.posts.map( ( item ) => {
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
		const adminUrl = site?.options?.admin_url ?? null;

		let authors = [];
		if ( data.authors ) {
			authors = data.authors.map( ( author ) => {
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
			posts = data.posts.map( ( post ) => {
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
	 * @param   {Object} payload Stats response payload
	 * @returns {Array}          Parsed data array
	 */
	statsVideo( payload ) {
		if ( ! payload ) {
			return null;
		}

		let data = [];
		if ( payload.data ) {
			data = payload.data.map( ( item ) => {
				return { period: item[ 0 ], value: item[ 1 ] };
			} );
		}

		let pages = [];
		if ( payload.pages ) {
			pages = payload.pages.map( ( item ) => {
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
	 * @param   {Object} data   Stats data
	 * @param   {Object} query  Stats query
	 * @param   {number} siteId Site ID
	 * @param   {Object} site   Site Object
	 * @returns {Array}       Normalized stats data
	 */
	statsTopAuthors( data, query = {}, siteId, site ) {
		if ( ! data || ! query.period || ! query.date ) {
			return [];
		}
		const { startOf } = rangeOfPeriod( query.period, query.date );
		const dataPath = query.summarize ? [ 'summary', 'authors' ] : [ 'days', startOf, 'authors' ];
		const authorsData = get( data, dataPath, [] );

		return authorsData.map( ( item ) => {
			const record = {
				label: item.name || translate( 'Untracked Authors' ),
				iconClassName: 'avatar-user',
				icon: parseAvatar( item.avatar ),
				children: null,
				value: item.views,
				className: 'module-content-list-item-large',
			};

			if ( item.posts && item.posts.length > 0 ) {
				record.children = item.posts.map( ( child ) => {
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
	 * @param   {Object} data Stats data
	 * @returns {Array}       Parsed data array
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
					link: hasChildren ? null : tagItem.link,
				};
			} );

			if ( hasChildren ) {
				children = item.tags.map( ( tagItem ) => {
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
	 * @param  {object} data   Stats data
	 * @param  {object} query  Stats query
	 * @returns {Array}        Parsed data array
	 */
	statsClicks( data, query ) {
		if ( ! data || ! query.period || ! query.date ) {
			return [];
		}

		const { startOf } = rangeOfPeriod( query.period, query.date );
		const dataPath = query.summarize ? [ 'summary', 'clicks' ] : [ 'days', startOf, 'clicks' ];
		const statsData = get( data, dataPath, [] );

		const output = statsData.map( ( item ) => {
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
				newRecord.children = item.children.map( ( child ) => {
					return {
						// Remove the parent name from the child name.
						// If the child name is the same as the parent name, use a slash instead.
						label: child.name?.replace( item.name, '' ) || '/',
						value: child.views,
						children: null,
						link: child.url,
						labelIcon: 'external',
					};
				} );
			}

			return newRecord;
		} );
		return output;
	},

	/*
	 * Returns a normalized statsReferrers array, ready for use in stats-module
	 *
	 * @param  {object} data   Stats data
	 * @param  {object} query  Stats query
	 * @param  {Int}    siteId Site ID
	 * @returns {Array}         Parsed data array
	 */
	statsReferrers( data, query, siteId ) {
		if ( ! data || ! query.period || ! query.date ) {
			return [];
		}

		const { startOf } = rangeOfPeriod( query.period, query.date );
		const dataPath = query.summarize ? [ 'summary', 'groups' ] : [ 'days', startOf, 'groups' ];
		let statsData = get( data, dataPath, [] );

		const parseItem = ( item ) => {
			let children;
			if ( item.children && item.children.length > 0 ) {
				children = item.children.map( ( child ) => {
					const parsed = parseItem( child );
					// Remove the parent name from the child name.
					// If the child name is the same as the parent name, use a slash instead.
					parsed.label = child.name?.replace( item.name, '' ) || '/';
					return parsed;
				} );
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

		// If there's only one item in a group, then we expand the children to the parent level.
		statsData = statsData.map( ( item ) => {
			if ( item.results?.length === 1 ) {
				return {
					...item.results[ 0 ],
					group: item.results[ 0 ].name,
					total: item.results[ 0 ].views,
				};
			}
			return item;
		} );

		return statsData.map( ( item ) => {
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

	statsAds( payload ) {
		if ( ! payload || ! payload.data ) {
			return [];
		}

		return parseChartData( payload, [ 'impressions', 'revenue', 'cpm' ] );
	},

	/*
	 * Returns a normalized statsSearchTerms array, ready for use in stats-module
	 *
	 * @param  {object} data   Stats data
	 * @param  {object} query  Stats query
	 * @returns {Array}         Parsed data array
	 */
	statsSearchTerms( data, query ) {
		if ( ! data || ! query.period || ! query.date ) {
			return [];
		}

		const { startOf } = rangeOfPeriod( query.period, query.date );
		const dataPath = query.summarize ? [ 'summary' ] : [ 'days', startOf ];
		const searchTerms = get( data, dataPath.concat( [ 'search_terms' ] ), [] );

		return searchTerms.map( ( day ) => {
			return {
				label: day.term,
				className: 'user-selectable',
				value: day.views,
			};
		} );
	},

	/*
	 * Returns a normalized statsFileDownloads array, ready for use in stats-module
	 *
	 * @param  {object} data   Stats data
	 * @param  {object} query  Stats query
	 * @returns {Array}         Parsed data array
	 */
	statsFileDownloads( data, query ) {
		if ( ! data || ! query.period || ! query.date ) {
			return [];
		}

		const { startOf } = rangeOfPeriod( query.period, query.date );
		const dataPath = query.summarize ? [ 'summary', 'files' ] : [ 'days', startOf, 'files' ];
		const statsData = get( data, dataPath, [] );

		return statsData.map( ( item ) => {
			return {
				label: item.relative_url,
				shortLabel: item.filename,
				page: null,
				value: item.downloads,
				link: item.download_url,
				linkTitle: item.relative_url,
				labelIcon: 'external',
			};
		} );
	},

	/**
	 * Returns a normalized statsEmailsSummary array, ready for use in stats-module
	 * @param   {Object} data   Stats data
	 * @param   {Object} query  Stats query
	 * @param   {number} siteId  Site ID
	 * @param   {Object} site    Site object
	 * @returns {Array}       Normalized stats data
	 */
	statsEmailsSummary( data, query, siteId, site ) {
		if ( ! data ) {
			return [];
		}

		const emailsData = get( data, [ 'posts' ], [] );

		return emailsData.map(
			( {
				id,
				href,
				date,
				title,
				type,
				opens,
				clicks,
				opens_rate,
				clicks_rate,
				unique_opens,
				unique_clicks,
				total_sends,
			} ) => {
				const detailPage = site ? `/stats/email/opens/day/${ id }/${ site.slug }` : null;
				return {
					id,
					href,
					date,
					label: title,
					type,
					value: clicks_rate || '0',
					opens: opens || '0',
					clicks: clicks || '0',
					opens_rate: opens_rate || '0',
					clicks_rate: clicks_rate || '0',
					unique_opens: unique_opens || '0',
					unique_clicks: unique_clicks || '0',
					total_sends: total_sends || '0',
					page: detailPage,
					actions: [
						{
							type: 'link',
							data: href,
						},
					],
				};
			}
		);
	},
};
