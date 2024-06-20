import { SiteSelect } from '@automattic/data-stores';
import { useSelect } from '@wordpress/data';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import { SITE_STORE } from '../stores';

export function useSiteIntent() {
	const { selectedSiteId } = useHelpCenterContext();
	const site = useSelect(
		( select ) => {
			if ( selectedSiteId ) {
				return ( select( SITE_STORE ) as SiteSelect ).getSite( selectedSiteId );
			}
		},
		[ selectedSiteId ]
	);
	return site?.options?.site_intent;
}
