import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { ExperimentAssignment } from '@automattic/explat-client';

/*
 * We cannot import `loadExperimentAssignment` directly from 'calypso/lib/explat'
 * because it runs a side effect that produces an error on SSR contexts.
 */
let loadExperimentAssignment = ( experimentName: string ): Promise< ExperimentAssignment > =>
	new Promise( ( resolve ) =>
		resolve( { experimentName, variationName: null, retrievedTimestamp: 0, ttl: 0 } )
	);
( async () => {
	if ( typeof window === 'undefined' ) {
		return;
	}
	try {
		( { loadExperimentAssignment } = await import( 'calypso/lib/explat' ) );
	} catch ( e ) {}
} )();

export type GlobalStylesStatus = {
	shouldLimitGlobalStyles: boolean;
	globalStylesInUse: boolean;
	globalStylesInPersonalPlan: boolean;
};

// While we are loading the Global Styles Info we can't assume that we should limit global styles, or we would be
// showing notices for paid sites until we fetch the data from the server.
const DEFAULT_GLOBAL_STYLES_INFO: GlobalStylesStatus = {
	shouldLimitGlobalStyles: false,
	globalStylesInUse: false,
	globalStylesInPersonalPlan: false,
};

function shouldRunGlobalStylesOnPersonalExperiment(
	siteId: number | null,
	isLoggedIn: boolean
): boolean {
	// Do not run it on SSR contexts.
	if ( typeof window === 'undefined' ) {
		return false;
	}

	// Always run it if a site has been selected.
	if ( siteId !== null ) {
		return true;
	}

	// Do not run it on the logged-out theme showcase.
	if ( ! isLoggedIn && window.location.pathname.startsWith( '/theme' ) ) {
		return false;
	}

	// Run it by default. Ideally, we should not run it if the user is logged out, but
	// we cannot rely on the `isUserLoggedIn` selector for users who just signed up
	// (see p1689256995094619-slack-C04DZ8M0GHW). So, we assume that this hook is not
	// used in any logged-out context apart from the theme showcase.
	return true;
}

const getGlobalStylesInfoForSite = (
	siteId: number | null,
	isLoggedIn: boolean
): Promise< GlobalStylesStatus > => {
	if ( ! shouldRunGlobalStylesOnPersonalExperiment( siteId, isLoggedIn ) ) {
		return new Promise( ( resolve ) =>
			resolve( {
				shouldLimitGlobalStyles: true,
				globalStylesInUse: false,
				globalStylesInPersonalPlan: false,
			} )
		);
	}

	if ( siteId === null ) {
		return new Promise( ( resolve ) =>
			loadExperimentAssignment( 'calypso_global_styles_personal' ).then( ( experimentAssignment ) =>
				resolve( {
					shouldLimitGlobalStyles: true,
					globalStylesInUse: false,
					globalStylesInPersonalPlan: experimentAssignment.variationName === 'treatment',
				} )
			)
		);
	}

	return wpcom.req
		.get( {
			path: `sites/${ siteId }/global-styles/status`,
			apiNamespace: 'wpcom/v2/',
		} )
		.then( ( response: GlobalStylesStatus ) => ( {
			...DEFAULT_GLOBAL_STYLES_INFO,
			...response,
		} ) )
		.catch( () => DEFAULT_GLOBAL_STYLES_INFO );
};

export function useSiteGlobalStylesStatus(
	siteIdOrSlug: number | string | null = null
): GlobalStylesStatus {
	const selectedSiteId = useSelector( getSelectedSiteId );
	const isLoggedIn = useSelector( isUserLoggedIn );

	// When site id is null it means that the site hasn't been created yet.
	const siteId = useSelector( ( state ) => {
		const currentSiteId = siteIdOrSlug ?? selectedSiteId;
		if ( ! currentSiteId ) {
			return null;
		}

		const site = getSite( state, currentSiteId );
		return site?.ID ?? null;
	} );

	const { data: globalStylesInfo } = useQuery( {
		queryKey: [ 'globalStylesInfo', siteId, isLoggedIn ],
		queryFn: () => getGlobalStylesInfoForSite( siteId, isLoggedIn ),
		placeholderData: DEFAULT_GLOBAL_STYLES_INFO,
		refetchOnWindowFocus: false,
	} );

	return globalStylesInfo ?? DEFAULT_GLOBAL_STYLES_INFO;
}
