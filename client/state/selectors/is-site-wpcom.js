import { createSelector } from '@automattic/state-utils';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isJetpackSite from 'calypso/state/sites/selectors/is-jetpack-site';
import getSelectedSiteId from 'calypso/state/ui/selectors/get-selected-site-id';

/**
 * Return true if the questioned site is a WPCOM site ( Atomic or Simple ).
 *
 * @param {Object} state the global state tree
 * @param {number} siteId the questioned site ID.
 * @returns {boolean} Whether the site is a WPCOM site ( Atomic or Simple ).
 */
export default createSelector(
	( state, siteId = getSelectedSiteId( state ) ) =>
		! isJetpackSite( state, siteId ) || isAtomicSite( state, siteId ),
	( state, siteId = getSelectedSiteId( state ) ) => [
		isJetpackSite( state, siteId ),
		isAtomicSite( state, siteId ),
	]
);
