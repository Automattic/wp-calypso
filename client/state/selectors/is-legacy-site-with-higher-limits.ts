import isSiteWpcom from 'calypso/state/selectors/is-site-wpcom';
import { getSiteOptions } from 'calypso/state/sites/selectors';
import { AppState } from 'calypso/types';

/**
 * Determines if the site is old enough that it should have higher free site limits.
 *
 * When the Pro plan was launched on 2022-03-31, we also reduced some of the
 * features of the free plan (for example, 3 GB storage limit down to 0.5 GB).
 * Legacy sites created before that launch should still get the original limits
 * they were created with, though.
 *
 * Note that this does not check if the site is actually a free site *currently*
 * (it might have a paid plan and have even higher limits as a result of that).
 *
 * @param {Object} state Global state tree
 * @param {number} siteId Site ID
 * @returns {boolean} True if the site is considered a legacy site
 */
export default function isLegacySiteWithHigherLimits( state: AppState, siteId: number ): boolean {
	if ( ! siteId ) {
		return false;
	}

	// Note this checks for both simple and Atomic sites.
	if ( ! isSiteWpcom( state, siteId ) ) {
		return false;
	}

	const siteOptions = getSiteOptions( state, siteId );
	const createdAt = siteOptions?.created_at ?? '';

	if ( ! createdAt ) {
		return false;
	}

	// This matches the date checked in is_legacy_site_with_higher_limits() on
	// the server.
	return createdAt < '2022-04-01 00:00:00';
}
