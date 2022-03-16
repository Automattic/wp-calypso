import { isEnabled } from '@automattic/calypso-config';
import { isE2ETest } from 'calypso/lib/e2e';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import type { AppState } from 'calypso/types';

export function isEligibleForProPlan( state: AppState, siteId?: number ): boolean {
	if ( isE2ETest() ) {
		return false;
	}

	if ( siteId && ( isJetpackSite( state, siteId ) || isSiteWPForTeams( state, siteId ) ) ) {
		return false;
	}

	return isEnabled( 'plans/pro-plan' );
}
