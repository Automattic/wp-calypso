import { isEnabled } from '@automattic/calypso-config';
import { isPro } from '@automattic/calypso-products';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import isSiteWPForTeams from 'calypso/state/selectors/is-site-wpforteams';
import { isJetpackSite, getSite } from 'calypso/state/sites/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import type { AppState } from 'calypso/types';

export function isEligibleForProPlan( state: AppState, siteId?: number | null ): boolean {
	if (
		siteId &&
		( ( isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId ) ) ||
			isSiteWPForTeams( state, siteId ) )
	) {
		return false;
	}
	siteId = siteId || getSelectedSiteId( state );
	const selectedSite = getSite( state, siteId || '' );
	const currentPlan = selectedSite?.plan;
	if ( currentPlan && isPro( currentPlan ) ) {
		return true;
	}

	return isEnabled( 'plans/pro-plan' );
}
