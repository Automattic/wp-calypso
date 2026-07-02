import { fetchReaderTeams } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const isAutomatticianQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'is-automattician' ],
		queryFn: async () => {
			const { teams } = await fetchReaderTeams();
			return teams.some( ( team ) => team.slug === 'a8c' );
		},
	} );
