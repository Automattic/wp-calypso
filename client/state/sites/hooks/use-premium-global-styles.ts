import { useSelector } from 'react-redux';
import wpcom from 'calypso/lib/wp';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

type GlobalStyleInfo = {
	shouldLimitGlobalStyles: boolean;
	globalStylesInUse: boolean;
};

let fetched: Promise< GlobalStyleInfo >;
const fetchGlobalStyleInfo = ( siteId ): Promise< GlobalStyleInfo > => {
	if ( ! siteId ) {
		return Promise.reject( 'No site id' );
	}

	if ( ! fetched ) {
		fetched = wpcom.req.get( {
			path: `sites/${ siteId }/global-styles-info`,
			apiNamespace: 'wpcom/v2/',
		} );
	}

	return fetched;
};

export function usePremiumGlobalStyles( callback: ( globalStyleInfo: GlobalStyleInfo ) => void ) {
	const params = new URLSearchParams( window.location.search );
	const siteSlugParam = params.get( 'siteSlug' );
	const siteIdParam = params.get( 'siteId' );
	const selectedSiteId = useSelector( getSelectedSiteId );

	const siteId = useSelector( ( state ) => {
		const siteIdOrSlug = selectedSiteId ?? siteIdParam ?? siteSlugParam;
		if ( ! siteIdOrSlug ) {
			return null;
		}
		const site = getSite( state, siteIdOrSlug );
		return site?.ID ?? null;
	} );

	fetchGlobalStyleInfo( siteId )
		.then( callback )
		.catch( () => undefined );
}
