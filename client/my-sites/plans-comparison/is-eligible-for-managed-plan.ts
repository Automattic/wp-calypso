import { getPlan, PLAN_WPCOM_MANAGED } from '@automattic/calypso-products';
import { isE2ETest } from 'calypso/lib/e2e';
import { getPlanSlug } from 'calypso/state/plans/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import type { AppState } from 'calypso/types';

export function isEligibleForManagedPlan( state: AppState, siteId?: number ): boolean {
	if ( isE2ETest() ) {
		return false;
	}

	if ( siteId && isJetpackSite( state, siteId ) ) {
		return false;
	}

	const productId = getPlan( PLAN_WPCOM_MANAGED )?.getProductId() || 0;

	return Boolean( getPlanSlug( state, productId ) );
}
