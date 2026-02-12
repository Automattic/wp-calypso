import { createSelector } from '@automattic/state-utils';
import getSites from 'calypso/state/selectors/get-sites';
import type { AppState } from 'calypso/types';

/**
 * Returns true if the user has at least one domain-only site (registered domain without a full site).
 */
export default createSelector(
	( state: AppState ): boolean =>
		getSites( state ).some( ( site ) => site && ( site.options?.is_domain_only ?? false ) ),
	( state ) => [ state.sites.items ]
);
