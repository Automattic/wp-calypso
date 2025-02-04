import { ExperimentAssignment } from '@automattic/explat-client';
import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

export type GlobalStylesStatus = {
	shouldLimitGlobalStyles: boolean;
	globalStylesInUse: boolean;
	globalStylesInPersonalPlan?: boolean;
};

// While we are loading the Global Styles Info we can't assume that we should limit global styles, or we would be
// showing notices for paid sites until we fetch the data from the server.
const DEFAULT_GLOBAL_STYLES_INFO: GlobalStylesStatus = {
	shouldLimitGlobalStyles: false,
	globalStylesInUse: false,
	globalStylesInPersonalPlan: false,
};

/*
 * We cannot import `loadExperimentAssignment` directly from 'calypso/lib/explat'
 * because it runs a side effect that produces an error on SSR contexts.
 */
let loadExperimentAssignment = ( experimentName: string ): Promise< ExperimentAssignment > =>
	Promise.resolve( { experimentName, variationName: null, retrievedTimestamp: 0, ttl: 0 } );

if ( typeof window !== 'undefined' ) {
	import( 'calypso/lib/explat' )
		.then( ( module ) => {
			loadExperimentAssignment = module.loadExperimentAssignment;
		} )
		// eslint-disable-next-line @typescript-eslint/no-empty-function
		.catch( () => {} );
}

function shouldRunGlobalStylesOnPersonalExperiment(
	siteId: number | null,
	userLoggedIn: boolean
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
	if ( ! userLoggedIn && window.location.pathname.startsWith( '/theme' ) ) {
		return false;
	}

	// Run it by default. Ideally, we should not run it if the user is logged out, but
	// we cannot rely on the `isUserLoggedIn` selector for users who just signed up
	// (see pbxNRc-2HR-p2#comment-4607). So, we assume that this hook is not used in
	// any logged-out context apart from the theme showcase.
	return true;
}

const getGlobalStylesInfoForSite = (
	siteId: number | null,
	userLoggedIn: boolean = false
): Promise< GlobalStylesStatus > => {
	if ( ! shouldRunGlobalStylesOnPersonalExperiment( siteId, userLoggedIn ) ) {
		return Promise.resolve( {
			shouldLimitGlobalStyles: true,
			globalStylesInUse: false,
			globalStylesInPersonalPlan: false,
		} );
	}

	if ( siteId === null ) {
		return loadExperimentAssignment( 'calypso_plans_global_styles_personal_20240127' ).then(
			( experimentAssignment ) =>
				Promise.resolve( {
					shouldLimitGlobalStyles: true,
					globalStylesInUse: false,
					globalStylesInPersonalPlan: !! experimentAssignment?.variationName,
				} )
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
	const userLoggedIn = useSelector( isUserLoggedIn );

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
		queryKey: [ 'globalStylesInfo', siteId ],
		queryFn: () => getGlobalStylesInfoForSite( siteId, userLoggedIn ),
		placeholderData: DEFAULT_GLOBAL_STYLES_INFO,
		refetchOnWindowFocus: false,
	} );

	return globalStylesInfo ?? DEFAULT_GLOBAL_STYLES_INFO;
}
