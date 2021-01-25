/**
 * Internal dependencies
 */
import 'calypso/state/teams/init';

export default function isRequestingReaderTeams( state ) {
	return !! state.teams.isRequesting;
}
