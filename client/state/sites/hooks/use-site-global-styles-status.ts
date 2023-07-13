import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

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

function isObject( x: unknown ): x is Record< string, unknown > {
	return typeof x === 'object' && x !== null;
}

const getExperimentAssignment = ( experimentName: string ): string | null => {
	return wpcom.req
		.get(
			{
				path: '/experiments/0.1.0/assignments/calypso',
				apiNamespace: 'wpcom/v2',
			},
			{
				experiment_name: experimentName,
			}
		)
		.then( ( response: unknown ) =>
			isObject( response ) &&
			isObject( response.variations ) &&
			typeof response.ttl === 'number' &&
			0 < response.ttl
				? response.variations[ experimentName ]
				: null
		)
		.catch( () => null );
};

const getGlobalStylesInfoForSite = (
	siteId: number | null,
	currentUserHasGlobalStylesInPersonalPlan: boolean
): GlobalStylesStatus => {
	if ( siteId == null ) {
		return {
			shouldLimitGlobalStyles: true,
			globalStylesInUse: false,
			globalStylesInPersonalPlan: currentUserHasGlobalStylesInPersonalPlan,
		};
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
	if ( ! isLoggedIn && window.location.pathname.startsWith( '/themes' ) ) {
		return false;
	}

	// Run it by default. Ideally, we should not run it if the user is logged out, but
	// we cannot rely on the `isUserLoggedIn` selector for users who just signed up
	// (see p1689256995094619-slack-C04DZ8M0GHW). So, we assume that this hook is not
	// used in any logged-out context apart from the theme showcase.
	return true;
}

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

	const { data: globalStylesOnPersonalExperimentAssignment } = useQuery( {
		queryKey: [ 'globalStylesOnPersonalExperimentAssignment', siteId, isLoggedIn ],
		queryFn: () => getExperimentAssignment( 'calypso_global_styles_personal' ),
		placeholderData: null,
		refetchOnWindowFocus: false,
		enabled: shouldRunGlobalStylesOnPersonalExperiment( siteId, isLoggedIn ),
	} );
	const currentUserHasGlobalStylesInPersonalPlan =
		globalStylesOnPersonalExperimentAssignment === 'treatment';

	const { data: globalStylesInfo } = useQuery( {
		queryKey: [ 'globalStylesInfo', siteId, currentUserHasGlobalStylesInPersonalPlan ],
		queryFn: () => getGlobalStylesInfoForSite( siteId, currentUserHasGlobalStylesInPersonalPlan ),
		placeholderData: DEFAULT_GLOBAL_STYLES_INFO,
		refetchOnWindowFocus: false,
	} );

	return globalStylesInfo ?? DEFAULT_GLOBAL_STYLES_INFO;
}
