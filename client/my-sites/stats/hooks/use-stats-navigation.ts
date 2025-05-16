import { useEffect, useMemo, useState } from '@wordpress/element';
import { buildQueryString } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

type QueryArgs = Record< string, string | null >;

const STORAGE_KEY = 'jp-stats-navigation';

const localizedTabNames: { [ key: string ]: string | null } = {
	traffic: translate( 'Traffic' ),
	insights: translate( 'Insights' ),
	store: translate( 'Store' ),
	ads: translate( 'Ads' ),
	subscribers: translate( 'Subscribers' ),
	posts: translate( 'Posts & pages' ),
	authors: translate( 'Authors' ),
	postDetails: null, // Last item in the history, the text is not displayed anywhere but this is used to track the item in history stack.
};

const possibleBackLinks: { [ key: string ]: string | null } = {
	traffic: '/stats/day/',
	insights: '/stats/insights/',
	store: '/stats/store/',
	ads: '/stats/ads/',
	subscribers: '/stats/subscribers/',
	posts: '/stats/day/posts/',
	authors: '/stats/day/authors/',
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
];

const defaultLastScreen = 'traffic';

const getFilteredQueryParams = ( queryParams: QueryArgs ): QueryArgs => {
	return Object.fromEntries(
		Object.entries( queryParams ).filter( ( [ key ] ) => SUPPORTED_QUERY_PARAMS.includes( key ) )
	);
};

/**
 * Hook for managing stats navigation state
 * Supports reading/writing from sessionStorage and initializing from query params
 * @returns { { text: string; url: string | null } }
 */
export const useStatsNavigationHistory = (): { text: string; url: string | null } => {
	const [ lastScreen, setLastScreen ] = useState< {
		lastScreen: string;
		queryParams: QueryArgs;
	} >( {
		lastScreen: defaultLastScreen,
		queryParams: {},
	} );
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );

	useEffect( () => {
		try {
			const navState = JSON.parse( sessionStorage.getItem( STORAGE_KEY ) || '[]' );
			const lastItem = Array.isArray( navState ) && navState.length >= 2 ? navState[ navState.length - 2 ] : {};

			// Make sure it's array and select last item
			if ( lastItem && lastItem.lastScreen ) {
				setLastScreen( lastItem );
			} else {
				setLastScreen( {
					lastScreen: defaultLastScreen,
					queryParams: {},
				} );
			}
		} catch ( e ) {}
	}, [] );

	const backLink = useMemo( () => {
		if ( ! siteSlug ) {
			return null;
		}

		const backLink = possibleBackLinks[ lastScreen.lastScreen ];

		if ( ! backLink ) {
			return null;
		}

		const queryParams = buildQueryString( getFilteredQueryParams( lastScreen.queryParams ) );

		return backLink + siteSlug + ( queryParams ? '?' + queryParams : '' );
	}, [ lastScreen, siteSlug ] );

	return {
		text: localizedTabNames[ lastScreen.lastScreen ] || '',
		url: backLink,
	};
};

/**
 * Utility to record the current screen for back navigation
 * @param {string} screen - Current screen identifier
 * @param {Object} queryParams - Query parameters for the screen
 * @param {boolean} reset - Whether to reset the navigation history
 */
export const recordCurrentScreen = (
	screen: string,
	queryParams: QueryArgs = {},
	reset: boolean = false
): void => {
	try {
		if ( ! screen || ! ( screen in localizedTabNames ) ) {
			return;
		}

		const filteredQueryParams = getFilteredQueryParams( queryParams );
		const currentEntry = {
			lastScreen: screen,
			queryParams: filteredQueryParams,
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
				( entry: { lastScreen: string } ) => entry.lastScreen === currentEntry.lastScreen
			)
		) {
			navigationHistory = navigationHistory.filter(
				( entry: { lastScreen: string } ) => entry.lastScreen !== currentEntry.lastScreen
			);
		}

		navigationHistory.push( currentEntry );
		sessionStorage.setItem( STORAGE_KEY, JSON.stringify( navigationHistory ) );
	} catch ( e ) {}
};

export const popCurrentScreenFromHistory = (): void => {
	try {
		const navigationHistory = JSON.parse( sessionStorage.getItem( STORAGE_KEY ) || '[]' );
		navigationHistory.pop();
		sessionStorage.setItem( STORAGE_KEY, JSON.stringify( navigationHistory ) );
	} catch ( e ) {}
};
