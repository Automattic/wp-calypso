import { createSelector } from '@automattic/state-utils';
import { canCurrentUser } from 'calypso/state/selectors/can-current-user';
import getSites from 'calypso/state/selectors/get-sites';
import type { AppState } from 'calypso/types';

import 'calypso/state/ui/init';

/**
 * Return true if a user has sites that are able to be connected to domains.
 * Returns false when a user has no sites or only self hosted Jetpack sites.
 * @param state Global state tree
 */

export const canAnySiteConnectDomains = createSelector(
	( state: AppState ): boolean =>
		getSites( state ).some(
			( site ) =>
				site &&
				canCurrentUser( state, site.ID, 'manage_options' ) &&
				! ( site.jetpack && ! ( site?.options?.is_automated_transfer ?? false ) ) && // Simple and Atomic sites. Not Jetpack sites.
				! ( site?.is_wpcom_staging_site ?? false ) &&
				! ( site?.options?.is_domain_only ?? false )
		),
	( state ) => [ state.sites.items, state.currentUser.capabilities ]
);
