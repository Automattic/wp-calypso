/**
 * External dependencies
 */
import { includes } from 'lodash';

/**
 * Internal dependencies
 */
import createSelector from 'calypso/lib/create-selector';
import getRewindCapabilities from 'calypso/state/selectors/get-rewind-capabilities';
import getRewindState from 'calypso/state/selectors/get-rewind-state';

/**
 * Based on the transactions list, returns metadata for rendering the app filters with counts
 *
 * @param  {object} state Global state tree
 * @param  {number} siteId the siteId
 * @returns {boolean} if the site allows restores
 */
export default createSelector(
	( state, siteId ) => {
		const siteCapabilities = getRewindCapabilities( state, siteId );
		const rewind = getRewindState( state, siteId );

		const restoreStatus = rewind.rewind && rewind.rewind.status;
		return (
			'active' === rewind.state &&
			! ( 'queued' === restoreStatus || 'running' === restoreStatus ) &&
			includes( siteCapabilities, 'restore' )
		);
	},
	( state, siteId ) => {
		return [ getRewindCapabilities( state, siteId ), getRewindState( state, siteId ) ];
	}
);
