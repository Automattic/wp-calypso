import { fetchReaderTeams, ReaderTeam } from '../../data/reader-teams';

export const isA8CTeamMemberQuery = () => ( {
	queryKey: [ 'is-a8c-team-member' ],
	queryFn: fetchReaderTeams,
	select: ( data: { number: number; teams: ReaderTeam[] } ): boolean =>
		data.teams.some( ( team: ReaderTeam ) => team.slug === 'a8c' ),
} );
