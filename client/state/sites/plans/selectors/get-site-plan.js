import { createSelector } from '@automattic/state-utils';
import { getPlansBySiteId } from 'calypso/state/sites/plans/selectors/get-plans-by-site';

/**
 * Returns a site specific plan
 *
 * @param  {Object} state        global state
 * @param  {number|undefined} siteId       the site id
 * @param  {string} productSlug  the plan product slug
 * @returns {Object} the matching plan
 */
export const getSitePlan = createSelector(
	( state, siteId, productSlug ) => {
		const plansBySiteId = getPlansBySiteId( state, siteId );
		if ( ! plansBySiteId || ! plansBySiteId.data ) {
			return null;
		}
		return plansBySiteId.data.filter( ( plan ) => plan.productSlug === productSlug ).shift();
	},
	( state, siteId ) => getPlansBySiteId( state, siteId )
);
