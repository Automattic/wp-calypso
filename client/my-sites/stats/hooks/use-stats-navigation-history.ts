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
};

const SUPPORTED_QUERY_PARAMS: string[] = [
	'startDate',
	'endDate',
	'num',
	'summarize',
	'chartStart',
	'chartEnd',
	'shortcut',
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
export const useStatsNavigationHistory = (): { text: string; url: string | null } => {
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
					Array.isArray( navState ) && navState.length >= 2 ? navState[ navState.length - 2 ] : {};

				// Make sure it's array and select last item
				if ( lastItem && lastItem.screen ) {
					setLastScreen( lastItem );
				} else {
					setLastScreen( {
						screen: defaultLastScreen,
						queryParams: {},
						period: 'day',
					} );
				}
			}
		} catch ( e ) {}
	}, [ localizedTabNames ] );

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
