import { isEnabled } from '@automattic/calypso-config';
import { select } from '@wordpress/data';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import wpcom from 'calypso/lib/wp';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

type GlobalStylesStatus = {
	shouldLimitGlobalStyles: boolean;
	globalStylesInUse: boolean;
};

// While we are loading the Global Styles Info we can't assume that we should limit global styles, or we would be
// showing notices for paid sites until we fetch the data from the server.
const DEFAULT_GLOBAL_STYLES_INFO: GlobalStylesStatus = {
	shouldLimitGlobalStyles: false,
	globalStylesInUse: false,
};

const getGlobalStylesInfoForSite = ( siteId: number | null ): GlobalStylesStatus => {
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

export function usePremiumGlobalStyles(): GlobalStylesStatus {
	const params = new URLSearchParams( window.location.search );
	const siteSlugParam = params.get( 'siteSlug' );
	const siteIdParam = params.get( 'siteId' );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const onboard = select( ONBOARD_STORE ).getState();

	// When site id is null it means that the site hasn't been created yet.
	const siteId = useSelector( ( state ) => {
		const siteIdOrSlug =
			onboard?.stepProgress !== undefined ? siteIdParam ?? siteSlugParam : selectedSiteId;

		if ( ! siteIdOrSlug ) {
			return null;
		}

		const site = getSite( state, siteIdOrSlug );
		return site?.ID ?? null;
	} );

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
