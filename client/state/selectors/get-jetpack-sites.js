import { createSelector } from '@automattic/state-utils';
import getSites from 'calypso/state/selectors/get-sites';
import { isJetpackSite } from 'calypso/state/sites/selectors';

/**
 * Get all Jetpack sites
 *
 * @param {Object} state  Global state tree
 * @returns {Array}        Array of Jetpack Sites objects
 */
export default createSelector(
	( state ) => getSites( state ).filter( ( site ) => isJetpackSite( state, site.ID ) ),
	( state ) => [ state.sites.items, state.currentUser.capabilities ]
);
