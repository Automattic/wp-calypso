/**
 * External dependencies
 */
import cookie from 'cookie';

/**
 * Internal dependencies
 */
import { isAutomatticTeamMember } from 'calypso/reader/lib/teams';
import { getReaderTeams } from 'calypso/state/teams/selectors';

export default ( state ) => {
	// Disable if explicitly requested by the `?disable-nav-unification` query param.
	if ( new URL( document.location ).searchParams.has( 'disable-nav-unification' ) ) {
		return false;
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
