import getSitePlan from './get-site-plan';
import type { PlanSlug } from '@automattic/calypso-products';
import type { AppState } from 'calypso/types';

export default function getSitePlanSlug( state: AppState, siteId?: number | null ) {
	return siteId ? ( getSitePlan( state, siteId )?.product_slug as PlanSlug ) : null;
}
