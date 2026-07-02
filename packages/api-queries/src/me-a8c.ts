import { fetchReaderTeams } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const isAutomatticianQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'is-automattician' ],
		queryFn: fetchReaderTeams,
		select: ( data ) => data.teams.some( ( team ) => team.slug === 'a8c' ),
	} );
