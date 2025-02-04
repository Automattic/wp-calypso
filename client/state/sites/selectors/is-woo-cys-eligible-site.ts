import { isSiteOnECommerceTrial, isSiteOnWooExpress } from '../plans/selectors';
import getSiteOption from './get-site-option';
import type { AppState } from 'calypso/types';

/**
 * Returns whether the site is eligible for WooCommerce CYS
 */
export default function isWooCYSEligibleSite( state: AppState, siteId: number ) {
	if ( ! ( isSiteOnECommerceTrial( state, siteId ) || isSiteOnWooExpress( state, siteId ) ) ) {
		return false;
	}

	const createdAt = getSiteOption( state, siteId, 'created_at' );
	if ( ! createdAt || typeof createdAt !== 'string' ) {
		return false;
	}

	// Customize store feature is only enabled for site created after 2024-01-02 8:00pm PT.
	// See https://github.com/Automattic/wc-calypso-bridge/pull/1357/files#diff-6d5a457ea3858f7fd68351384967651376e1a4768ba9a55352bd7fd691a54415R157
	return new Date( createdAt ) >= new Date( 1704254400 * 1000 );
}
