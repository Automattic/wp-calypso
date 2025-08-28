import { queryOptions } from '@tanstack/react-query';
import { fetchReaderTeams } from '../../data/reader-teams';

export const isAutomatticianQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'is-automattician' ],
		queryFn: fetchReaderTeams,
		select: ( data ) => data.teams.some( ( team ) => team.slug === 'a8c' ),
	} );
