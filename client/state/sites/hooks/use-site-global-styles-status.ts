import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { useSelector } from 'calypso/state';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { ExperimentAssignment } from '@automattic/explat-client';
import type { ExperimentOptions } from '@automattic/explat-client-react-helpers';

/* eslint-disable @typescript-eslint/no-unused-vars */
let useExperiment = (
	experimentName: string,
	options?: ExperimentOptions
): [ boolean, ExperimentAssignment | null ] => [ false, null ];
/* eslint-enable @typescript-eslint/no-unused-vars */
( async () => {
	if ( typeof window === 'undefined' ) {
		return;
	}
	try {
		( { useExperiment } = await import( 'calypso/lib/explat' ) );
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

	const [ , experimentAssignment ] = useExperiment( 'calypso_global_styles_personal', {
		isEligible: siteId === null && isLoggedIn,
	} );
	const currentUserHasGlobalStylesInPersonalPlan =
		experimentAssignment?.variationName === 'treatment';

	const { data: globalStylesInfo } = useQuery( {
		queryKey: [ 'globalStylesInfo', siteId, currentUserHasGlobalStylesInPersonalPlan ],
		queryFn: () => getGlobalStylesInfoForSite( siteId, currentUserHasGlobalStylesInPersonalPlan ),
		placeholderData: DEFAULT_GLOBAL_STYLES_INFO,
		refetchOnWindowFocus: false,
	} );

	return globalStylesInfo ?? DEFAULT_GLOBAL_STYLES_INFO;
}
