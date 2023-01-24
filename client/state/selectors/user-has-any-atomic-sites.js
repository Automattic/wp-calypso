import { createSelector } from '@automattic/state-utils';
import getSitesItems from 'calypso/state/selectors/get-sites-items';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';

/**
 * Whether the user currently has any Atomic sites
 *
 * @param {Object} state  Global state tree
 * @returns {boolean}
 */
export default createSelector(
	( state ) => {
		const siteIds = Object.keys( getSitesItems( state ) );
		return siteIds.some( ( siteId ) => isAtomicSite( state, siteId ) );
	},
	( state ) => [ getSitesItems( state ) ]
);
