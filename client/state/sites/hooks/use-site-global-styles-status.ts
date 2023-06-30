import { useQuery } from '@tanstack/react-query';
import { useExperiment } from 'calypso/lib/explat';
import wpcom from 'calypso/lib/wp';

export type GlobalStylesStatus = {
	shouldLimitGlobalStyles: boolean;
	globalStylesInUse: boolean;
	globalStylesInPersonalPlan: boolean;
};

// While we are loading the Global Styles Info we can't assume that we should limit global styles, or we would be
// showing notices for paid sites until we fetch the data from the server.
export const DEFAULT_GLOBAL_STYLES_INFO: GlobalStylesStatus = {
	shouldLimitGlobalStyles: false,
	globalStylesInUse: false,
	globalStylesInPersonalPlan: false,
};

export const getGlobalStylesInfoForSite = (
	siteId: number | null,
	currentUserHasGlobalStylesInPersonal: boolean
): GlobalStylesStatus => {
	if ( siteId == null ) {
		return {
			shouldLimitGlobalStyles: true,
			globalStylesInUse: false,
			globalStylesInPersonalPlan: currentUserHasGlobalStylesInPersonal,
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

export function useSiteGlobalStylesStatus( siteId: number ): GlobalStylesStatus {
	const [ , currentUserHasGlobalStylesInPersonal ] = useExperiment(
		'calypso_global_styles_personal'
	);
	const { data } = useQuery( {
		queryKey: [ 'globalStylesInfo', siteId, currentUserHasGlobalStylesInPersonal?.variationName ],
		queryFn: () =>
			getGlobalStylesInfoForSite(
				siteId,
				currentUserHasGlobalStylesInPersonal?.variationName === 'treatment'
			),
		placeholderData: DEFAULT_GLOBAL_STYLES_INFO,
		refetchOnWindowFocus: false,
	} );

	return data ?? DEFAULT_GLOBAL_STYLES_INFO;
}
