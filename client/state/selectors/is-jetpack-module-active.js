/**
 * External dependencies
 */

import { get } from 'lodash';
import isSiteAutomatedTransfer from 'state/selectors/is-site-automated-transfer';
import isPrivateSite from 'state/selectors/is-private-site';

/**
 * Returns true if the module is currently active. False otherwise.
 * Returns null if the status for the queried site and module is unknown.
 *
 * @param  {object}  state       Global state tree
 * @param  {number}  siteId      The ID of the site we're querying
 * @param  {string}  moduleSlug  Slug of the module
 * @returns {?boolean}            Whether the module is active
 */
export default function isJetpackModuleActive( state, siteId, moduleSlug ) {
	if ( moduleSlug === 'photon' || moduleSlug === 'photon-cdn' ) {
		// When site is atomic and private, we filter out photon from active modules list.
		// This isn't actually changing any stored preferences, which means photon is going to
		// keep working once privacy is disabled.
		const siteIsAtomicPrivate =
			isSiteAutomatedTransfer( state, siteId ) && isPrivateSite( state, siteId );
		if ( siteIsAtomicPrivate ) {
			return false;
		}
	}
	return get( state.jetpack.modules.items, [ siteId, moduleSlug, 'active' ], null );
}
