import { select } from '@wordpress/data';
import { useQuery } from 'react-query';
import { useSelector } from 'react-redux';
import { ONBOARD_STORE } from 'calypso/landing/stepper/stores';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import {
	DEFAULT_GLOBAL_STYLES_INFO,
	getGlobalStylesInfoForSite,
} from './use-site-global-styles-status';
import type { GlobalStylesStatus } from './use-site-global-styles-status';
import type { OnboardSelect } from '@automattic/data-stores';

export function usePremiumGlobalStyles(): GlobalStylesStatus {
	const params = new URLSearchParams( window.location.search );
	const siteSlugParam = params.get( 'siteSlug' );
	const siteIdParam = params.get( 'siteId' );
	const selectedSiteId = useSelector( getSelectedSiteId );
	const onboard = ( select( ONBOARD_STORE ) as OnboardSelect ).getState();

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
