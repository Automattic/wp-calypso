import { isEnabled } from '@automattic/calypso-config';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import wpcom from 'calypso/lib/wp';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

type GlobalStylesInfo = {
	shouldLimitGlobalStyles: boolean;
	globalStylesInUse: boolean;
};

type Site = {
	isCreated: boolean;
	id: number;
};

const NEW_SITE_GLOBAL_STYLES_INFO: GlobalStylesInfo = {
	// The next line should be replaced with true once the Gating global styles feature is live.
	// That will make all non-created sites to limit global styles.
	shouldLimitGlobalStyles: isEnabled( 'limit-global-styles' ),
	globalStylesInUse: false,
};

// While we are loading the Global Styles Info we can't assume that we should limit global styles, or we would be
// showing notices for paid sites until we fetch the data from the server.
const DEFAULT_GLOBAL_STYLES_INFO: GlobalStylesInfo = {
	shouldLimitGlobalStyles: false,
	globalStylesInUse: false,
};

const getGSInfoEndpointForSite = ( siteId: number ) => ( {
	path: `sites/${ siteId }/global-styles/status`,
	apiNamespace: 'wpcom/v2/',
} );

const mapSiteIdToSite = ( siteId: number | null ) => ( {
	isCreated: !! siteId,
	id: siteId ?? 0,
} );

const getGlobalStylesInfoForSite = ( site: Site ) => {
	if ( ! site.isCreated ) {
		return NEW_SITE_GLOBAL_STYLES_INFO;
	}

	const globalStylesInfoEndpoint = getGSInfoEndpointForSite( site.id );
	return wpcom.req.get( globalStylesInfoEndpoint ).catch( () => DEFAULT_GLOBAL_STYLES_INFO );
};

export function usePremiumGlobalStyles(): GlobalStylesInfo {
	const params = new URLSearchParams( window.location.search );
	const siteSlugParam = params.get( 'siteSlug' );
	const siteIdParam = params.get( 'siteId' );
	const selectedSiteId = useSelector( getSelectedSiteId );

	// When site id is null it means that the site hasn't been created yet.
	const siteId = useSelector( ( state ) => {
		const siteIdOrSlug = selectedSiteId ?? siteIdParam ?? siteSlugParam;
		if ( ! siteIdOrSlug ) {
			return null;
		}
		const site = getSite( state, siteIdOrSlug );
		return site?.ID ?? null;
	} );

	const site = mapSiteIdToSite( siteId );

	const { data } = useQuery(
		[ 'globalStylesInfo', site ],
		() => getGlobalStylesInfoForSite( site ),
		{
			placeholderData: DEFAULT_GLOBAL_STYLES_INFO,
			refetchOnWindowFocus: false,
		}
	);

	return data;
}
