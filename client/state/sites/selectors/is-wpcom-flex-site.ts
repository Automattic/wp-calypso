import { createSelector } from '@automattic/state-utils';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { AppState } from 'calypso/types';

/**
 * Returns true if the current site is a WordPress.com Flex site
 * @param  {Object}   state         Global state tree
 * @returns {?boolean}               Whether the current site is a WP.com Flex site or not
 */
export default createSelector(
	( state: AppState, siteId = getSelectedSiteId( state ) ): boolean | null => {
		const site = getSite( state, siteId );
		return !! site && ( site?.is_wpcom_flex ?? false );
	},
	// Recompute when the site's flex flag changes
	( state: AppState, siteId = getSelectedSiteId( state ) ) => [
		getSite( state, siteId )?.is_wpcom_flex,
	]
);
