import { createSelector } from '@automattic/state-utils';
import { userCan } from 'calypso/lib/site/utils';
import getSites from 'calypso/state/selectors/get-sites';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import type { SiteDetails } from '@automattic/data-stores';
import type { AppState } from 'calypso/types';

/**
 * Get all the sites which are deleted after account closure
 * (WordPress.com sites which the user is the owner of)
 */
export default createSelector( ( state: AppState ): SiteDetails[] =>
	getSites( state ).filter(
		( site: SiteDetails ) => ! isJetpackSite( state, site.ID ) && userCan( 'own_site', site )
	)
);
