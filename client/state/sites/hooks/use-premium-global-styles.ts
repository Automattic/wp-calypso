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

type Site = {
	isCreated: boolean;
	id: number;
};

type Onboard = {
	stepProgress?: {
		count: number;
		progress: number;
	};
};

const NEW_SITE_GLOBAL_STYLES_INFO: GlobalStylesStatus = {
	// The next line should be replaced with true once the Gating global styles feature is live.
	// That will make all non-created sites to limit global styles.
	shouldLimitGlobalStyles: isEnabled( 'limit-global-styles' ),
	globalStylesInUse: false,
};

// While we are loading the Global Styles Info we can't assume that we should limit global styles, or we would be
// showing notices for paid sites until we fetch the data from the server.
const DEFAULT_GLOBAL_STYLES_INFO: GlobalStylesStatus = {
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

const mapResponseToGlobalStylesStatus = ( data: GlobalStylesStatus ): GlobalStylesStatus => ( {
	...DEFAULT_GLOBAL_STYLES_INFO,
	...data,
} );

const isOnboarding = ( onboard: Onboard ): boolean => onboard?.stepProgress !== undefined;

const getGlobalStylesInfoForSite = ( site: Site ): GlobalStylesStatus => {
	if ( ! site.isCreated ) {
		return NEW_SITE_GLOBAL_STYLES_INFO;
	}

	const globalStylesInfoEndpoint = getGSInfoEndpointForSite( site.id );
	return wpcom.req
		.get( globalStylesInfoEndpoint )
		.then( mapResponseToGlobalStylesStatus )
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
		if ( isOnboarding( onboard ) && ! siteIdParam && ! siteSlugParam ) {
			return null;
		}

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

	return data ?? DEFAULT_GLOBAL_STYLES_INFO;
}
