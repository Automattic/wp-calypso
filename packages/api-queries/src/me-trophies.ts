import { fetchTrophies } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const trophiesQuery = () =>
	queryOptions( {
		queryKey: [ 'me', 'trophies' ],
		queryFn: fetchTrophies,
	} );
