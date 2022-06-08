import { isEnabled } from '@automattic/calypso-config';
import { isPro } from '@automattic/calypso-products';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { getCurrentPlan } from 'calypso/state/sites/plans/selectors';
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

	const currentPlan = getCurrentPlan( state, siteId );
	if ( currentPlan && isPro( currentPlan ) ) {
		return true;
	}

	return isEnabled( 'plans/pro-plan' );
}
