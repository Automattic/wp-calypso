import 'calypso/state/hosting/init';

/**
 * Whether or not we're currently fetching the WordPress version.
 * @param  {Object}  state   Global state tree
 * @param  {number|null}  siteId The ID of the site we're querying
 * @returns {boolean}
 */
export function isFetchingAtomicHostingWpVersion( state, siteId ) {
	return state.atomicHosting?.[ siteId ]?.isFetchingWpVersion ?? false;
}
