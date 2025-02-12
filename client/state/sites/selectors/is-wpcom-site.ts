import { createSelector } from '@automattic/state-utils';
import { getSite } from 'calypso/state/sites/selectors';
import isSimpleSite from 'calypso/state/sites/selectors/is-simple-site';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { AppState } from 'calypso/types';

/**
 * Returns true if the current site is a WordPress.com site (simple or WoA)
 * @param  {Object}   state         Global state tree
 * @returns {?boolean}               Whether the current site is a WordPress.com site or not
 */
export default createSelector(
	( state: AppState, siteId = getSelectedSiteId( state ) ): boolean | null => {
		const site = getSite( state, siteId );
		return !! site && ( ( isSimpleSite( state, siteId ) || site?.is_wpcom_atomic ) ?? false );
	},
	( state: AppState, siteId = getSelectedSiteId( state ) ) => [ isSimpleSite( state, siteId ) ]
);
