import { fetchReaderTeams, ReaderTeam } from '../../data/reader-teams';

export const isAutomattianQuery = () => ( {
	queryKey: [ 'me-is-automattian' ],
	queryFn: fetchReaderTeams,
	select: ( data: { number: number; teams: ReaderTeam[] } ): boolean =>
		data.teams.some( ( team: ReaderTeam ) => team.slug === 'a8c' ),
} );
