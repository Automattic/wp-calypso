/**
 * Internal dependencies
 */
import getSitePlanSlug from 'calypso/state/sites/selectors/get-site-plan-slug';
import { isBusinessPlan, isEcommercePlan } from '@automattic/calypso-products';

export default function siteHasBusinessOrEcommercePlan( state, siteId ) {
	const planSlug = getSitePlanSlug( state, siteId );
	return isBusinessPlan( planSlug ) || isEcommercePlan( planSlug );
}
