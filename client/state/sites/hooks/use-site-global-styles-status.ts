import { isEnabled } from '@automattic/calypso-config';
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
			// The next line should be replaced with true once the Gating global styles feature is live.
			// That will make all non-created sites to limit global styles.
			shouldLimitGlobalStyles: isEnabled( 'limit-global-styles' ),
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
	const { data } = useQuery(
		[ 'globalStylesInfo', siteId ],
		() => getGlobalStylesInfoForSite( siteId ),
		{
			placeholderData: DEFAULT_GLOBAL_STYLES_INFO,
			refetchOnWindowFocus: false,
		}
	);

	return data ?? DEFAULT_GLOBAL_STYLES_INFO;
}
