import { createSelector } from '@automattic/state-utils';
import getSitesItems from 'calypso/state/selectors/get-sites-items';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import type { AppState } from 'calypso/types';

/**
 * Whether the user currently has any Atomic sites
 */
export default createSelector(
	( state: AppState ): boolean => {
		const siteIds = Object.keys( getSitesItems( state ) );
		return siteIds.some( ( siteId ) => isAtomicSite( state, Number( siteId ) ) );
	},
	( state: AppState ) => [ getSitesItems( state ) ]
);
