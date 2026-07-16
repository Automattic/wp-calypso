import { useEffect, useMemo, useState } from '@wordpress/element';
import { addQueryArgs, getQueryArgs } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getSiteSlug, getSiteAdminUrl } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

type QueryArgs = Record< string, string | null >;

const STORAGE_KEY = 'jp-stats-navigation';

const possibleBackLinks: { [ key: string ]: string | null } = {
	traffic: '/stats/{period}/',
	insights: '/stats/insights/',
	store: '/stats/store/',
	ads: '/stats/ads/',
	realtime: '/stats/realtime/',
	subscribers: '/stats/subscribers/{period}/',
	posts: '/stats/{period}/posts/',
	authors: '/stats/{period}/authors/',
	filedownloads: '/stats/{period}/filedownloads/',
	referrers: '/stats/{period}/referrers/',
	locations: '/stats/{period}/locations/',
	countryviews: '/stats/{period}/countryviews/',
	utm: '/stats/{period}/utm/',
	clicks: '/stats/{period}/clicks/',
	searchterms: '/stats/{period}/searchterms/',
	videoplays: '/stats/{period}/videoplays/',
	annualstats: '/stats/day/annualstats/',
	postList: '{adminUrl}edit.php',
	emailsummary: '/stats/{period}/emails/',
	postDetails: null, // Last item in the history, the text is not displayed anywhere but this is used to track the item in history stack.
	videodetails: null, // Same as postDetails: tracked in the history stack, never rendered as a crumb.
};

const SUPPORTED_QUERY_PARAMS: string[] = [
	'startDate',
	'endDate',
	'num',
	'summarize',
	'chartStart',
	'chartEnd',
	'shortcut',
	'tab',
	'jp_s',
	'jp_post_type',
	'jp_status',
	'jp_orderby',
	'jp_order',
	'jp_paged',
	'jp_author',
	'jp_cat',
	'jp_category_name',
	'jp_m',
];

const defaultLastScreen = 'traffic';

const getFilteredQueryParams = ( queryParams: QueryArgs ): QueryArgs => {
	return Object.fromEntries(
		Object.entries( queryParams ).filter( ( [ key ] ) => SUPPORTED_QUERY_PARAMS.includes( key ) )
	);
};

// Params the Traffic page actually understands. Used when synthesizing a Traffic
// back link from the current screen, so summary-only params (startDate, num,
// summarize, …) don't leak onto the Traffic URL.
const TRAFFIC_QUERY_PARAMS: string[] = [ 'chartStart', 'chartEnd', 'shortcut', 'tab' ];

const getTrafficQueryParams = ( queryParams: QueryArgs ): QueryArgs => {
	return Object.fromEntries(
		Object.entries( queryParams ).filter( ( [ key ] ) => TRAFFIC_QUERY_PARAMS.includes( key ) )
	);
};

const DATE_RANGE_PARAMS: string[] = [ 'chartStart', 'chartEnd', 'shortcut' ];

// Mirrors StatsDateControl's bestPeriodForDays, so a back link lands on a period
// able to display the range (e.g. hour-period pages clamp longer ranges).
const bestPeriodForRange = ( chartStart: string, chartEnd: string ): string => {
	const days = Math.round( ( Date.parse( chartEnd ) - Date.parse( chartStart ) ) / 86400000 ) + 1;
	if ( days <= 30 ) {
		return 'day';
	}
	if ( days <= 175 ) {
		return 'week';
	}
	if ( days <= 750 ) {
		return 'month';
	}
	return 'year';
};

// The date range is a global filter across Stats screens: when navigating back, the
// range selected on the current screen wins over the one recorded when the previous
// screen was left. Only applies to period-aware screens (Traffic, module summaries).
const applyCurrentDateRange = < T extends { screen: string; queryParams: QueryArgs } >(
	entry: T,
	currentParams: QueryArgs
): T => {
	const { chartStart, chartEnd, shortcut } = currentParams;
	if ( ! possibleBackLinks[ entry.screen ]?.includes( '{period}' ) || ! chartStart || ! chartEnd ) {
		return entry;
	}

	const queryParams = Object.fromEntries(
		Object.entries( entry.queryParams || {} ).filter(
			( [ key ] ) => ! DATE_RANGE_PARAMS.includes( key )
		)
	);
	queryParams.chartStart = chartStart;
	queryParams.chartEnd = chartEnd;
	if ( shortcut ) {
		queryParams.shortcut = shortcut;
	}

	return { ...entry, queryParams, period: bestPeriodForRange( chartStart, chartEnd ) };
};

const prepareAdminQueryParams = ( queryParams: QueryArgs ) => {
	const JP_PREFIX = 'jp_';
	return Object.fromEntries(
		Object.entries( queryParams ).map( ( [ key, value ] ) => [
			key.startsWith( JP_PREFIX ) ? key.slice( JP_PREFIX.length ) : key,
			value,
		] )
	);
};

/**
 * Hook for managing stats navigation state
 * Supports reading/writing from sessionStorage and initializing from query params
 * @returns { { text: string; url: string | null } }
 */
export const useStatsNavigationHistory = (
	// Pass the current screen's query (e.g. `context.query`) so the back link
	// re-derives after in-place range changes; the history is read once otherwise.
	currentQuery?: unknown
): { text: string; url: string | null } => {
	const localizedTabNames: { [ key: string ]: string | null } = useMemo(
		() => ( {
			traffic: translate( 'Traffic' ),
			insights: translate( 'Insights' ),
			store: translate( 'Store' ),
			realtime: translate( 'Realtime' ),
			ads: translate( 'Ads' ),
			subscribers: translate( 'Subscribers' ),
			posts: translate( 'Posts & pages' ),
			authors: translate( 'Authors' ),
			filedownloads: translate( 'File Downloads' ),
			referrers: translate( 'Referrers' ),
			locations: translate( 'Locations' ),
			countryviews: translate( 'Countries' ),
			utm: translate( 'UTM' ),
			clicks: translate( 'Clicks' ),
			searchterms: translate( 'Search Terms' ),
			videoplays: translate( 'Videos' ),
			annualstats: translate( 'Annual insights' ),
			postList: translate( 'Post List' ),
			emailsummary: translate( 'Emails' ),
			postDetails: null, // Last item in the history, the text is not displayed anywhere but this is used to track the item in history stack.
			videodetails: null,
		} ),
		[]
	);

	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const adminBaseUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );

	const [ lastScreen, setLastScreen ] = useState< {
		screen: string;
		queryParams: QueryArgs;
		period: string | null;
	} >( {
		screen: defaultLastScreen,
		queryParams: {},
		period: 'day',
	} );

	useEffect( () => {
		try {
			const args = getQueryArgs( window.location.search );
			const fromParam = args.from;

			if ( typeof fromParam === 'string' && fromParam in localizedTabNames ) {
				const queryParams = getFilteredQueryParams( args as QueryArgs );

				setLastScreen( {
					screen: args.from as string,
					queryParams,
					period: null,
				} );
			} else {
				const navState = JSON.parse( sessionStorage.getItem( STORAGE_KEY ) || '[]' );

				// Select the second last item from the history stack as the back link.
				// The last item in the stack if the current screen.
				const lastItem =
					Array.isArray( navState ) && navState.length >= 2
						? navState[ navState.length - 2 ]
						: null;

				// Make sure it's array and select last item
				if ( lastItem && lastItem.screen ) {
					const currentItem = navState[ navState.length - 1 ];
					setLastScreen( applyCurrentDateRange( lastItem, currentItem?.queryParams || {} ) );
				} else {
					// No prior history (e.g. direct load or a full page load that clears
					// sessionStorage): fall back to Traffic, but carry the current screen's
					// query params/period so the selected date range survives the round-trip.
					const currentItem =
						Array.isArray( navState ) && navState.length >= 1
							? navState[ navState.length - 1 ]
							: null;

					setLastScreen( {
						screen: defaultLastScreen,
						queryParams: getTrafficQueryParams( currentItem?.queryParams || {} ),
						period: currentItem?.period || 'day',
					} );
				}
			}
		} catch ( e ) {}
	}, [ localizedTabNames, currentQuery ] );

	const backLink = useMemo( () => {
		if ( ! siteSlug ) {
			return null;
		}

		let backLink = possibleBackLinks[ lastScreen.screen ];

		if ( ! backLink ) {
			return null;
		}

		if ( backLink.includes( '{period}' ) && lastScreen.period ) {
			backLink = backLink.replace( '{period}', lastScreen.period );
		}

		// Handle back link with admin URL.
		if ( backLink.includes( '{adminUrl}' ) ) {
			if ( ! adminBaseUrl ) {
				return null;
			}

			backLink = backLink.replace( '{adminUrl}', adminBaseUrl );
			return addQueryArgs( backLink, prepareAdminQueryParams( lastScreen.queryParams ) );
		}

		return addQueryArgs( backLink + siteSlug, getFilteredQueryParams( lastScreen.queryParams ) );
	}, [ lastScreen, siteSlug, adminBaseUrl ] );

	return {
		text: localizedTabNames[ lastScreen.screen ] || '',
		url: backLink,
	};
};

/**
 * Hook that returns the full navigation trail as breadcrumb items.
 * Excludes the current screen (last item in history).
 * Each item has a label and URL for building breadcrumb navigation.
 */
export const useStatsBreadcrumbTrail = (
	// Pass the current screen's query (e.g. `context.query`) so the trail re-derives
	// after in-place range changes; the history is read once otherwise.
	currentQuery?: unknown
): Array< { label: string; url: string | null } > => {
	const localizedTabNames: { [ key: string ]: string | null } = useMemo(
		() => ( {
			traffic: translate( 'Traffic' ),
			insights: translate( 'Insights' ),
			store: translate( 'Store' ),
			realtime: translate( 'Realtime' ),
			ads: translate( 'Ads' ),
			subscribers: translate( 'Subscribers' ),
			posts: translate( 'Most viewed' ),
			authors: translate( 'Authors' ),
			filedownloads: translate( 'File Downloads' ),
			referrers: translate( 'Referrers' ),
			locations: translate( 'Locations' ),
			countryviews: translate( 'Countries' ),
			utm: translate( 'UTM' ),
			clicks: translate( 'Clicks' ),
			searchterms: translate( 'Search Terms' ),
			videoplays: translate( 'Videos' ),
			annualstats: translate( 'Annual insights' ),
			postList: translate( 'Post List' ),
			emailsummary: translate( 'Emails' ),
			postDetails: null,
			videodetails: null,
		} ),
		[]
	);

	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );
	const adminBaseUrl = useSelector( ( state ) => getSiteAdminUrl( state, siteId ) );

	const [ trail, setTrail ] = useState< Array< { label: string; url: string | null } > >( [] );

	useEffect( () => {
		// A top-level Traffic crumb synthesized from the current screen, so the root
		// "Stats" breadcrumb always links back to Stats even when there is no usable
		// history (direct load, a full page load that clears sessionStorage, a trail
		// made up entirely of screens without a back link, or corrupted storage). When
		// a current screen entry is available its date range is carried so it survives
		// the round-trip back to Traffic; otherwise it links to the default range.
		const trafficFallback = ( current?: {
			queryParams: QueryArgs;
			period: string | null;
		} ): Array< { label: string; url: string | null } > => {
			const label = localizedTabNames[ defaultLastScreen ];
			const link = possibleBackLinks[ defaultLastScreen ];
			if ( ! link || ! label || ! siteSlug ) {
				return [];
			}
			return [
				{
					label,
					url: addQueryArgs(
						link.replace( '{period}', current?.period || 'day' ) + siteSlug,
						getTrafficQueryParams( current?.queryParams || {} )
					),
				},
			];
		};

		try {
			const navState = JSON.parse( sessionStorage.getItem( STORAGE_KEY ) || '[]' );
			if ( ! Array.isArray( navState ) || navState.length < 1 ) {
				setTrail( trafficFallback() );
				return;
			}

			if ( navState.length === 1 ) {
				setTrail( trafficFallback( navState[ 0 ] ) );
				return;
			}

			// Exclude the last item (current screen).
			const items = navState.slice( 0, -1 );
			const currentItem = navState[ navState.length - 1 ];

			const breadcrumbs = items
				.map( ( rawEntry: { screen: string; queryParams: QueryArgs; period: string | null } ) => {
					const entry = applyCurrentDateRange( rawEntry, currentItem?.queryParams || {} );
					const label = localizedTabNames[ entry.screen ];
					if ( ! label ) {
						return null;
					}

					let link = possibleBackLinks[ entry.screen ];
					if ( ! link ) {
						return null;
					}

					if ( link.includes( '{period}' ) && entry.period ) {
						link = link.replace( '{period}', entry.period );
					}

					if ( link.includes( '{adminUrl}' ) ) {
						if ( ! adminBaseUrl ) {
							return null;
						}
						link = link.replace( '{adminUrl}', adminBaseUrl );
						return {
							label,
							url: addQueryArgs( link, prepareAdminQueryParams( entry.queryParams ) ),
						};
					}

					return {
						label,
						url: siteSlug
							? addQueryArgs( link + siteSlug, getFilteredQueryParams( entry.queryParams ) )
							: null,
					};
				} )
				.filter( Boolean ) as Array< { label: string; url: string | null } >;

			setTrail( breadcrumbs.length ? breadcrumbs : trafficFallback( currentItem ) );
		} catch ( e ) {
			setTrail( trafficFallback() );
		}
	}, [ localizedTabNames, siteSlug, adminBaseUrl, currentQuery ] );

	return trail;
};

/**
 * Utility to record the current screen for back navigation
 * @param {string} screen - Current screen identifier
 * @param {Object} args - Arguments for the screen
 * @param {Object} args.queryParams - Query parameters for the screen
 * @param {string} args.period - Period for the screen
 * @param {boolean} reset - Whether to reset the navigation history
 */
export const recordCurrentScreen = (
	screen: string,
	args: {
		queryParams: QueryArgs;
		period: string | null;
	} = {
		queryParams: {},
		period: null,
	},
	reset: boolean = false
): void => {
	try {
		if ( ! screen || ! ( screen in possibleBackLinks ) ) {
			return;
		}

		const filteredQueryParams = getFilteredQueryParams( args.queryParams );
		const currentEntry = {
			screen,
			queryParams: filteredQueryParams,
			period: args.period,
		};

		// Get current navigation history array
		let navigationHistory = reset
			? []
			: JSON.parse( sessionStorage.getItem( STORAGE_KEY ) || '[]' );

		// Ensure navigationHistory is an array
		if ( ! Array.isArray( navigationHistory ) ) {
			navigationHistory = [];
		}

		// If the history already has the same screen, remove it
		if (
			navigationHistory.some(
				( entry: { screen: string } ) => entry.screen === currentEntry.screen
			)
		) {
			navigationHistory = navigationHistory.filter(
				( entry: { screen: string } ) => entry.screen !== currentEntry.screen
			);
		}

		navigationHistory.push( currentEntry );
		sessionStorage.setItem( STORAGE_KEY, JSON.stringify( navigationHistory ) );
	} catch ( e ) {}
};

/**
 * Utility to pop the current screen from the navigation history
 */
export const popCurrentScreenFromHistory = (): void => {
	try {
		const navigationHistory = JSON.parse( sessionStorage.getItem( STORAGE_KEY ) || '[]' );
		navigationHistory.pop();
		sessionStorage.setItem( STORAGE_KEY, JSON.stringify( navigationHistory ) );
	} catch ( e ) {}
};
