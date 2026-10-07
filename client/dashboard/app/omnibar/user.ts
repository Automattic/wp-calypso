import { useQuery } from '@tanstack/react-query';
import { AUTH_QUERY_KEY, authQueryFn } from '../auth';
import type { User } from '@automattic/api-core';

export function useOmnibarUser( { user, enabled }: { user?: User; enabled: boolean } ) {
	const { data } = useQuery( {
		queryKey: AUTH_QUERY_KEY,
		queryFn: authQueryFn,
		initialData: user,
		enabled,
		staleTime: 30 * 60 * 1000,
		retry: false,
		meta: { persist: false },
	} );

	return data;
}
