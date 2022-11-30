import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import getSiteSlug from './get-site-slug';

/**
 * Returns true if we want to show Cart in Jetpack cloud
 *
 * @param  {object}   state  Global state tree
 */
export default function isJetpackCloudCartEnabled( state ) {
	const siteId = getSelectedSiteId( state );
	const siteSlug = getSiteSlug( state, siteId );
	// We would want to change `true` to the param from A/B testing
	return true && siteSlug;
}
