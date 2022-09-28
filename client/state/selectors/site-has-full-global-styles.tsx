import { isEnabled } from '@automattic/calypso-config';
import { WPCOM_FEATURES_GLOBAL_STYLES } from '@automattic/calypso-products';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import type { AppState } from 'calypso/types';

/**
 * Checks if Global Styles are fully available to the given site.
 *
 * @param  {object}  state       Global state tree
 * @param  {number}  siteId      The ID of the site we're querying
 * @returns {boolean} Whether Global Styles are fully available (true) or restricted (false).
 */
export default function siteHasFullGlobalStyles( state: AppState, siteId: number ) {
	// Grant the full feature to sites created before we started to restrict it.
	// This cutoff blog ID needs to be updated once we launch the limited global styles to the public.
	if ( siteId < 210494207 ) {
		return true;
	}

	// Limit the full feature to sites that have an eligible purchase.
	if ( siteHasFeature( state, siteId, WPCOM_FEATURES_GLOBAL_STYLES ) ) {
		return true;
	}

	// Rest of sites are restricted if the feature flag is enabled. This check should be removed before launch.
	return ! isEnabled( 'limit-global-styles' );
}
