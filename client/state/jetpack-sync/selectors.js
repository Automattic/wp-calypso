/**
 * External dependencies
 */
import get from 'lodash/get';
import createSelector from 'lib/create-selector';

/**
 * Internal dependencies
 */
import utils from './utils';
import { getSelectedSiteId } from 'state/ui/selectors';

export function selectSyncStatus( state ) {
	const siteId = getSelectedSiteId( state );
	return get( state, [ 'jetpackSync', 'syncStatus', siteId ] );
}

export function selectFullSyncRequest( state ) {
	const siteId = getSelectedSiteId( state );
	return get( state, [ 'jetpackSync', 'fullSyncRequest', siteId ] );
}
