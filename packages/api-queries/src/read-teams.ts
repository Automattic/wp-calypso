import { fetchReaderTeams } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const readTeamsQuery = () => {
	return queryOptions( {
		queryKey: [ 'read', 'teams' ],
		queryFn: () => fetchReaderTeams(),
		staleTime: 5 * 60 * 1000,
	} );
};
