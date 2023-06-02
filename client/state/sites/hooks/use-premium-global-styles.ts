import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'calypso/state';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import {
	DEFAULT_GLOBAL_STYLES_INFO,
	getGlobalStylesInfoForSite,
} from './use-site-global-styles-status';
import type { GlobalStylesStatus } from './use-site-global-styles-status';

export function usePremiumGlobalStyles(
	siteIdOrSlug: number | string | null = 0
): GlobalStylesStatus {
	const selectedSiteId = useSelector( getSelectedSiteId );

	// When site id is null it means that the site hasn't been created yet.
	const siteId = useSelector( ( state ) => {
		const currentSiteId = siteIdOrSlug ?? selectedSiteId;
		if ( ! currentSiteId ) {
			return null;
		}

		const site = getSite( state, currentSiteId );
		return site?.ID ?? null;
	} );

	const { data } = useQuery( {
		queryKey: [ 'globalStylesInfo', siteId ],
		queryFn: () => getGlobalStylesInfoForSite( siteId ),
		placeholderData: DEFAULT_GLOBAL_STYLES_INFO,
		refetchOnWindowFocus: false,
	} );

	return data ?? DEFAULT_GLOBAL_STYLES_INFO;
}
