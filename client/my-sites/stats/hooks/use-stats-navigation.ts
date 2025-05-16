import { useEffect, useMemo, useState } from '@wordpress/element';
import { buildQueryString } from '@wordpress/url';
import { translate } from 'i18n-calypso';
import { useSelector } from 'calypso/state';
import { getSiteSlug } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

type QueryArgs = Record< string, string | null >;

const STORAGE_KEY = 'jp-stats-navigation';

const localizedTabNames: { [ key: string ]: string } = {
	traffic: translate( 'Traffic' ),
	insights: translate( 'Insights' ),
	store: translate( 'Store' ),
	ads: translate( 'Ads' ),
	subscribers: translate( 'Subscribers' ),
	posts: translate( 'Posts & pages' ),
	authors: translate( 'Authors' ),
};

const possibleBackLinks: { [ key: string ]: string | null } = {
	traffic: '/stats/day/',
	insights: '/stats/insights/',
	store: '/stats/store/',
	ads: '/stats/ads/',
	subscribers: '/stats/subscribers/',
	posts: '/stats/day/posts/',
	authors: '/stats/day/authors/',
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
export const useStatsNavigation = (): { text: string; url: string | null } => {
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
			const navState = JSON.parse( sessionStorage.getItem( STORAGE_KEY ) || '{}' );

			if ( ! navState.lastScreen ) {
				setLastScreen( {
					lastScreen: defaultLastScreen,
					queryParams: {},
				} );
			} else {
				setLastScreen( navState );
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
		text: localizedTabNames[ lastScreen.lastScreen ],
		url: backLink,
	};
};

/**
 * Utility to record the current screen for back navigation
 * @param {string} screen - Current screen identifier
 */
export const recordCurrentScreen = ( screen: string, queryParams: QueryArgs = {} ): void => {
	try {
		if ( ! ( screen in localizedTabNames ) ) {
			return;
		}

		const navState = JSON.parse( sessionStorage.getItem( STORAGE_KEY ) || '{}' );
		const filteredQueryParams = getFilteredQueryParams( queryParams );

		sessionStorage.setItem(
			STORAGE_KEY,
			JSON.stringify( { ...navState, lastScreen: screen, queryParams: filteredQueryParams } )
		);
	} catch ( e ) {}
};
