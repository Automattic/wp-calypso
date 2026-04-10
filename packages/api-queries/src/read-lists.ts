import { fetchReadSubscribedLists } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const readSubscribedListsQuery = () =>
	queryOptions( {
		queryKey: [ 'read', 'lists', 'subscribed' ],
		staleTime: 1000 * 60 * 5, // 5 minutes — lists change infrequently
		queryFn: () => fetchReadSubscribedLists(),
	} );
