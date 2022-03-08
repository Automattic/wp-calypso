import 'calypso/state/ui/init';
import { getSiteOption, getSitePlanSlug } from 'calypso/state/sites/selectors';
import type { AppState } from 'calypso/types';

/**
 * Returns true if the current site is a simple seller site (payment block, no Woo plan)
 *
 * @param {object} state Global state tree
 * @returns {boolean}
 */
export default function isSimpleSeller( state: AppState, siteId: number ): boolean | null {
	// Check if the site intent is 'sell'.
	const intent = getSiteOption( state, siteId, 'site_intent' );
	if ( ! intent || 'sell' !== intent ) {
		return false;
	}

	// If they have an eComm plan, they're not a simple seller.
	return 'ecommerce-bundle' !== getSitePlanSlug( state, siteId );
}
