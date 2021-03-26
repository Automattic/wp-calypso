/**
 * Internal dependencies
 */

import { getSite } from 'calypso/state/sites/selectors';

/**
 * Returns a normalized site ID from any key accepted by `getSite`. Intends to
 * handle cases where selecting a site was achieved by calling a polymorphic
 * method on the legacy `sites-list` module. The current Redux structure
 * expects a proper numeric ID to be dispatched in `SELECTED_SITE_SET` actions.
 *
 * @example
 * const numericID = getSiteId( state, siteSlug );
 * // or
 * const numericID = getSiteId( state, siteIdentifierOfUnknownFormat );
 *
 * @param  {object}  state       Global state tree
 * @param  {number|string|null}  siteIdOrSlug Site ID or slug
 * @returns {?number}            Site ID
 */
export default function getSiteId( state, siteIdOrSlug ) {
	if ( ! siteIdOrSlug ) {
		return null;
	}

	const site = getSite( state, siteIdOrSlug );
	if ( ! site ) {
		return null;
	}

	return site.ID;
}
