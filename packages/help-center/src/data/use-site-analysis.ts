import { useDebounce } from 'use-debounce';
import { useIsWpOrgSite } from './use-is-wporg-site';
import { useUserSites } from './use-user-sites';
import { useWpcomSite } from './use-wpcom-site';
import type { AnalysisReport } from '../types';

// a simple way to check if a string is host to save on API calls
function isHost( string: string | undefined ) {
	if ( string ) {
		return string.length > 4 && Boolean( string?.match( /\w{2,}\.\w{2,32}/ ) );
	}
	return false;
}

function urlMatches( trustedURL: string, userInputUrl: string | undefined ) {
	if ( ! trustedURL || ! userInputUrl ) {
		return false;
	}
	const normalizedInputUrl = userInputUrl.trim().toLowerCase();

	if ( trustedURL === normalizedInputUrl ) {
		return true;
	}
	try {
		const trustedURLObject = new URL( trustedURL );
		if ( trustedURLObject.host === normalizedInputUrl ) {
			return true;
		}
		const normalizedInputUrlObject = new URL( normalizedInputUrl );
		if ( trustedURLObject.host === normalizedInputUrlObject.host ) {
			return true;
		}
	} catch ( _e ) {
		// couldn't build URL object
		return false;
	}
}

/**
 * Analyses a site to determine whether its a WPCOM site, and if yes, it would fetch and return the site information (SiteDetails).
 * @param userId the user ID
 * @param siteURL the site URL
 * @param enabled whether the query is enabled
 */
export function useSiteAnalysis(
	userId: number | string,
	siteURL: string | undefined,
	enabled: boolean
): AnalysisReport {
	const [ debouncedSiteUrl ] = useDebounce( siteURL, 500 );
	const isEnabled = isHost( debouncedSiteUrl ) && enabled;
	const { data: userSites, isLoading: userSitesLoading } = useUserSites( userId, isEnabled );
	const { data: wpcomSite, isLoading: wpcomSiteLoading } = useWpcomSite(
		debouncedSiteUrl,
		isEnabled
	);
	const { data: isWporg, isLoading: wpOrgSiteLoading } = useIsWpOrgSite(
		debouncedSiteUrl,
		isEnabled
	);

	if ( ! isEnabled ) {
		return {
			result: 'DISABLED',
			siteURL,
			isWpcom: false,
		};
	}

	const usersOwned = Boolean(
		userSites?.sites.find( ( s ) => urlMatches( s.URL, debouncedSiteUrl ) )
	);

	if ( usersOwned ) {
		return { site: wpcomSite, result: 'OWNED_BY_USER', siteURL, isWpcom: true };
	} else if ( wpcomSite ) {
		// use the wpcomSite response URL instead of user input to
		// double check if the wpcom site belongs to the user before dismissing
		if ( userSites?.sites.find( ( s ) => urlMatches( s.URL, wpcomSite.URL ) ) ) {
			return { site: wpcomSite, result: 'OWNED_BY_USER', siteURL, isWpcom: true };
		}
		return { site: wpcomSite, result: 'NOT_OWNED_BY_USER', siteURL, isWpcom: true };
	} else if ( isWporg ) {
		return { result: 'WPORG', siteURL, isWpcom: false };
	}

	const isLoading = [ userSitesLoading, wpOrgSiteLoading, wpcomSiteLoading ].some( Boolean );

	return {
		result: isLoading ? 'LOADING' : 'UNKNOWN',
		siteURL,
		isWpcom: false,
	};
}
