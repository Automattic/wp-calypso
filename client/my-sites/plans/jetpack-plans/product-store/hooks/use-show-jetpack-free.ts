import isJetpackCloud from 'calypso/lib/jetpack/is-jetpack-cloud';
import { useSelector } from 'calypso/state';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';
import { isConnectionFlow } from '../../product-grid/utils';

export const useShowJetpackFree = () => {
	return useSelector( ( state ) => {
		if ( isConnectionFlow() ) {
			return true;
		}

		// If a site is passed by URL and the site is found in the app's state, we will assume the site
		// is connected, and thus, we don't need to show "Start with the free"
		if ( getSelectedSiteId( state ) ) {
			return false;
		}

		return isJetpackCloud();
	} );
};
