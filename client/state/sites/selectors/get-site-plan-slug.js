/**
 * Internal dependencies
 */
import getSitePlan from './get-site-plan';

export default function getSitePlanSlug( state, siteId ) {
	return getSitePlan( state, siteId )?.product_slug ?? null;
}
