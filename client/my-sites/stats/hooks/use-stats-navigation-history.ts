import { useEffect, useMemo, useState } from '@wordpress/element';
import { buildQueryString } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

type QueryArgs = Record< string, string | null >;

const STORAGE_KEY = 'jp-stats-navigation';

const possibleBackLinks: { [ key: string ]: string | null } = {
	traffic: '/stats/{period}/',
	insights: '/stats/insights/',
	store: '/stats/store/',
	ads: '/stats/ads/',
	subscribers: '/stats/subscribers/{period}/',
	posts: '/stats/{period}/posts/',
	authors: '/stats/{period}/authors/',
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
	const localizedTabNames: { [ key: string ]: string | null } = useMemo(
		() => ( {
			traffic: translate( 'Traffic' ),
			insights: translate( 'Insights' ),
			store: translate( 'Store' ),
			ads: translate( 'Ads' ),
			subscribers: translate( 'Subscribers' ),
			posts: translate( 'Posts & pages' ),
			authors: translate( 'Authors' ),
			postDetails: null,
		} ),
		[]
	);

	const [ lastScreen, setLastScreen ] = useState< {
		screen: string;
		queryParams: QueryArgs;
		period: string | null;
	} >( {
		screen: defaultLastScreen,
		queryParams: {},
		period: 'day',
	} );
	const siteId = useSelector( getSelectedSiteId );
	const siteSlug = useSelector( ( state ) => getSiteSlug( state, siteId ) );

	useEffect( () => {
		try {
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
		} catch ( e ) {}
	}, [] );

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

		const queryParams = buildQueryString( getFilteredQueryParams( lastScreen.queryParams ) );

		return backLink + siteSlug + ( queryParams ? '?' + queryParams : '' );
	}, [ lastScreen, siteSlug ] );

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
