/**
 * External dependencies
 */
import { get } from 'lodash';

/**
 * Internal dependencies
 */
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import isPrivateSite from 'calypso/state/selectors/is-private-site';

import 'calypso/state/jetpack/init';

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
	if ( moduleSlug === 'photon' || moduleSlug === 'photon-cdn' || moduleSlug === 'videopress' ) {
		// When site is atomic and private, we filter out certain modules from active modules list.
		// This isn't actually changing any stored preferences, which means they are going to
		// keep working once privacy is disabled.
		const siteIsAtomicPrivate =
			isSiteAutomatedTransfer( state, siteId ) && isPrivateSite( state, siteId );
		if ( siteIsAtomicPrivate ) {
			return false;
		}
	}
	return get( state.jetpack.modules.items, [ siteId, moduleSlug, 'active' ], null );
}
