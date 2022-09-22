import 'calypso/state/teams/init';
import getReaderTeams from './get-reader-teams';

export default function isA8cTeamMember( state ) {
	const teams = getReaderTeams( state );

	return !! teams.find( ( team ) => team.slug === 'a8c' );
}
