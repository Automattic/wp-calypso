import { get } from 'lodash';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors/get-current-plan';

/**
 * Returns a site's current plan's product slug
 *
 * @param  {Object}  state   Global State tree
 * @param  {number}  siteId  Site ID
 * @returns {?string}          The site's current plan's product slug
 */
export function getSitePlanSlug( state, siteId ) {
	return get( getCurrentPlan( state, siteId ), 'productSlug', null );
}
