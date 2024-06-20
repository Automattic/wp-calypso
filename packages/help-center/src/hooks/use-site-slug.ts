import { SiteSelect } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { SITE_STORE } from '../stores';

export function useSiteSlug() {
	const { selectedSiteId } = useHelpCenterContext();
	const site = useSelect(
		( select ) => {
			if ( selectedSiteId ) {
				return ( select( SITE_STORE ) as SiteSelect ).getSite( selectedSiteId );
			}
		},
		[ selectedSiteId ]
	);
	return site && new URL( site.URL ).host;
}
