import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export type GlobalStylesStatus = {
	shouldLimitGlobalStyles: boolean;
	globalStylesInUse: boolean;
};

// While we are loading the Global Styles Info we can't assume that we should limit global styles, or we would be
// showing notices for paid sites until we fetch the data from the server.
export const DEFAULT_GLOBAL_STYLES_INFO: GlobalStylesStatus = {
	shouldLimitGlobalStyles: false,
	globalStylesInUse: false,
};

export const getGlobalStylesInfoForSite = ( siteId: number | null ): GlobalStylesStatus => {
	if ( siteId == null ) {
		return {
			shouldLimitGlobalStyles: true,
			globalStylesInUse: false,
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
	const { data } = useQuery( {
		queryKey: [ 'globalStylesInfo', siteId ],
		queryFn: () => getGlobalStylesInfoForSite( siteId ),
		placeholderData: DEFAULT_GLOBAL_STYLES_INFO,
		refetchOnWindowFocus: false,
	} );

	return data ?? DEFAULT_GLOBAL_STYLES_INFO;
}
