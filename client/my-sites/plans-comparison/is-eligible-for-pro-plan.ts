import { isEnabled } from '@automattic/calypso-config';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import type { AppState } from 'calypso/types';

export function isEligibleForProPlan( state: AppState, siteId?: number ): boolean {
	if (
		siteId &&
		( ( isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId ) ) ||
			isSiteWPForTeams( state, siteId ) )
	) {
		return false;
	}

	return isEnabled( 'plans/pro-plan' );
}
