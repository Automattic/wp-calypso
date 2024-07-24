import { createSelector } from '@automattic/state-utils';
import { isP2Theme } from 'calypso/lib/site/utils';
import getSites from 'calypso/state/selectors/get-sites';
import type { AppState } from 'calypso/types';

import 'calypso/state/ui/init';

/**
 * Return true if is user has P2 enabled on any of their sites.
 * @param state Global state tree
 */

export const hasSiteWithP2 = createSelector(
	( state: AppState ): boolean =>
		getSites( state ).some( ( site ) => site && !! ( site?.options?.is_wpforteams_site || ( site?.options?.theme_slug && isP2Theme( site?.options?.theme_slug ) ) ) ),
	( state ) => [ state.sites.items ]
);
