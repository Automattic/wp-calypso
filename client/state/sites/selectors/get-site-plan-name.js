import getSitePlan from './get-site-plan';

export default function getSitePlanName( state, siteId ) {
	return getSitePlan( state, siteId )?.product_name_short ?? null;
}
