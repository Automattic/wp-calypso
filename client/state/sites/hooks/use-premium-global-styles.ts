import { isEnabled } from '@automattic/calypso-config';
import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';

type GlobalStylesStatus = {
	isFetchingGlobalStylesStatus: boolean;
	shouldLimitGlobalStyles: boolean;
	globalStylesInUse: boolean;
};

// While we are loading the Global Styles Info we can't assume that we should limit global styles, or we would be
// showing notices for paid sites until we fetch the data from the server.
const DEFAULT_GLOBAL_STYLES_INFO: GlobalStylesStatus = {
	isFetchingGlobalStylesStatus: false,
	shouldLimitGlobalStyles: false,
	globalStylesInUse: false,
};

const getGlobalStylesInfoForSite = ( siteId: number | null ): GlobalStylesStatus => {
	// When site id is null it means that the site hasn't been created yet.
	if ( siteId === null ) {
		return {
			...DEFAULT_GLOBAL_STYLES_INFO,
			// The next line should be replaced with true once the Gating global styles feature is live.
			// That will make all non-created sites to limit global styles.
			shouldLimitGlobalStyles: isEnabled( 'limit-global-styles' ),
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

export function usePremiumGlobalStyles( siteId: number | null = null ): GlobalStylesStatus {
	const { isLoading, data } = useQuery(
		[ 'globalStylesInfo', siteId ],
		() => getGlobalStylesInfoForSite( siteId ),
		{
			refetchOnWindowFocus: false,
		}
	);

	return {
		...DEFAULT_GLOBAL_STYLES_INFO,
		...data,
		isFetchingGlobalStylesStatus: isLoading,
	};
}
