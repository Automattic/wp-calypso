import { fetchUserLastDraft } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';

export const userLastDraftQuery = ( userId: number, enabled = true ) =>
	queryOptions( {
		queryKey: [ 'me', 'posts', 'last-draft', userId ],
		queryFn: () => fetchUserLastDraft( userId ),
		enabled: enabled && !! userId,
		staleTime: Infinity,
		retry: false,
		refetchOnWindowFocus: false,
		meta: { persist: false },
	} );
