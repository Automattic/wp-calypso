import { createSelector } from '@automattic/state-utils';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getSites from 'calypso/state/selectors/get-sites';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import type { AppState } from 'calypso/types';

import 'calypso/state/ui/init';

/**
 * Return true if is user is able to use plugins on any of their sites.
 * @param state Global state tree
 */

export const canAnySiteHavePlugins = createSelector(
	( state: AppState ): boolean =>
		getSites( state ).some(
			( site ) =>
				site &&
				isJetpackSite( state, site.ID ) &&
				canCurrentUser( state, site.ID, 'manage_options' ) &&
				site.visible
		),
	( state ) => [ state.sites.items, state.currentUser.capabilities ]
);
