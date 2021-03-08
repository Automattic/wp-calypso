/**
 * External dependencies
 */
import cookie from 'cookie';

/**
 * Internal dependencies
 */
import { isAutomatticTeamMember } from 'calypso/reader/lib/teams';
import { getReaderTeams } from 'calypso/state/teams/selectors';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { isJetpackSite } from 'calypso/state/sites/selectors';
import isAtomicSite from 'calypso/state/selectors/is-site-automated-transfer';
import { getCurrentUserId } from 'calypso/state/current-user/selectors';
import isNavUnificationNewUser from 'calypso/state/selectors/is-nav-unification-new-user';

// Gradual rollout (segment of existing users + all new users registered after March 5, 2021).
const CURRENT_ROLLOUT_SEGMENT_PERCENTAGE = 5;
// Test users found in test/e2e/config/local-decrypted.json.
const TEST_USER_IDS = [
	114387625,
	196072882,
	147903583,
	176665678,
	191685058,
	99044787,
	115575915,
	125513142,
	140566456,
	139474794,
	139474794,
	102365391,
	106276422,
	106276977,
	107524077,
	107524337,
	107524381,
	107524493,
	107524451,
	107523085,
	127372741,
	123892165,
	126716843,
	132724203,
];

export default ( state ) => {
	// Disable if explicitly requested by the `?disable-nav-unification` query param.
	if ( new URL( document.location ).searchParams.has( 'disable-nav-unification' ) ) {
		return false;
	}

	// Disabled for Jetpack sites.
	const siteId = getSelectedSiteId( state );
	if ( isJetpackSite( state, siteId ) && ! isAtomicSite( state, siteId ) ) {
		return false;
	}

	const userId = getCurrentUserId( state );
	// Disable for Test Users.
	if ( TEST_USER_IDS.includes( userId ) ) {
		return false;
	}

	// Users belonging to the current segment OR New Users.
	if ( userId % 100 < CURRENT_ROLLOUT_SEGMENT_PERCENTAGE || isNavUnificationNewUser( state ) ) {
		return true;
	}

	// Enable nav-unification for all a12s.
	if ( isAutomatticTeamMember( getReaderTeams( state ) ) ) {
		return true;
	}

	// Enable for E2E tests checking Nav Unification.
	// @see https://github.com/Automattic/wp-calypso/pull/50144.
	const cookies = cookie.parse( document.cookie );
	if ( cookies.flags && cookies.flags.includes( 'nav-unification' ) ) {
		return true;
	}

	// Disabled by default.
	return false;
};
