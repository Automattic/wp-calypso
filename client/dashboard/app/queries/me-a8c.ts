import { fetchReaderTeams, ReaderTeam } from '../../data/reader-teams';

export const isAutomatticianQuery = () => ( {
	queryKey: [ 'me', 'is-automattician' ],
	queryFn: fetchReaderTeams,
	select: ( data: { number: number; teams: ReaderTeam[] } ): boolean =>
		data.teams.some( ( team: ReaderTeam ) => team.slug === 'a8c' ),
} );
