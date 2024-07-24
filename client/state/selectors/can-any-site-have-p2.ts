import { createSelector } from '@automattic/state-utils';
import getSites from 'calypso/state/selectors/get-sites';
import type { AppState } from 'calypso/types';

import 'calypso/state/ui/init';

/**
 * Return true if is user has P2 enabled on any of their sites.
 * @param state Global state tree
 */

export const canAnySiteHaveP2 = createSelector(
	( state: AppState ): boolean =>
		getSites( state ).some( ( site ) => site && site?.options?.is_wpforteams_site ),
	( state ) => [ state.sites.items ]
);
