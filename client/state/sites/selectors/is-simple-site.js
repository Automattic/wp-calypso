import { createSelector } from '@automattic/state-utils';
import { getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';

/**
 * Returns true if the current site is a simple site
 *
 * @param  {object}   state         Global state tree
 * @returns {?boolean}               Whether the current site is a simple site or not
 */
const isSimpleSite = createSelector(
	( state ) => {
		const siteId = getSelectedSiteId( state );
		const site = getSite( state, siteId );

		return site && ! site.is_wpcom_atomic;
	},
	( state ) => [ getSelectedSiteId( state ) ]
);

export default isSimpleSite;
