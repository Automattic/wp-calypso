import { isEnabled } from '@automattic/calypso-config';
import { isUserLoggedIn } from 'calypso/state/current-user/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import getSiteSlug from './get-site-slug';
import type { AppState } from 'calypso/types';

/**
 * Returns true if we want to show Cart in Jetpack cloud
 *
 * @param  {Object}   state  Global state tree
 */
export default function isJetpackCloudCartEnabled( state: AppState ) {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSiteSlug( state, siteId );
	return Boolean( isEnabled( 'jetpack/pricing-page-cart' ) && isUserLoggedIn( state ) && siteSlug );
}
