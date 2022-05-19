import { WPCOM_FEATURES_BACKUPS_RESTORE } from '@automattic/calypso-products';
import { createSelector } from '@automattic/state-utils';
import getRewindState from 'calypso/state/selectors/get-rewind-state';
import siteHasFeature from 'calypso/state/selectors/site-has-feature';
import isJetpackSiteMultiSite from 'calypso/state/sites/selectors/is-jetpack-site-multi-site';

/**
 * Based on the transactions list, returns metadata for rendering the app filters with counts
 *
 * @param  {object} state Global state tree
 * @param  {number} siteId the siteId
 * @returns {boolean} if the site allows restores
 */
export default createSelector(
	( state, siteId ) => {
		const siteHasRestore = siteHasFeature( state, siteId, WPCOM_FEATURES_BACKUPS_RESTORE );
		const rewind = getRewindState( state, siteId );
		const isMultiSite = isJetpackSiteMultiSite( state, siteId );

		const restoreStatus = rewind.rewind && rewind.rewind.status;
		return (
			! isMultiSite &&
			'active' === rewind.state &&
			! ( 'queued' === restoreStatus || 'running' === restoreStatus ) &&
			siteHasRestore
		);
	},
	( state, siteId ) => {
		return [
			siteHasFeature( state, siteId, WPCOM_FEATURES_BACKUPS_RESTORE ),
			getRewindState( state, siteId ),
			isJetpackSiteMultiSite( state, siteId ),
		];
	}
);
