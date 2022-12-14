import { createSelector } from '@automattic/state-utils';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getSites from 'calypso/state/selectors/get-sites';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import type { AppState } from 'calypso/types';

import 'calypso/state/ui/init';

/**
 * Return an array with the selected site or all sites able to have plugins
 *
 * @param {object} state  Global state tree
 * @returns {Array}        Array of Sites objects with the result
 */

export default createSelector(
	( state: AppState ) =>
		getSites( state ).filter(
			( site ) =>
				isJetpackSite( state, site.ID ) &&
				canCurrentUser( state, site.ID, 'manage_options' ) &&
				site.visible
		),
	( state ) => [
		getSites( state ),
		...getSites( state ).map( ( site ) => isJetpackSite( state, site.ID ) ),
		...getSites( state ).map( ( site ) => canCurrentUser( state, site.ID, 'manage_options' ) ),
	]
);
