import { isEnabled } from '@automattic/calypso-config';
import { isE2ETest } from 'calypso/lib/e2e';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import type { AppState } from 'calypso/types';

export function isEligibleForManagedPlan( state: AppState, siteId?: number ): boolean {
	if ( isE2ETest() ) {
		return false;
	}

	if ( siteId && isJetpackSite( state, siteId ) ) {
		return false;
	}

	return isEnabled( 'plans/managed-plan' );
}
