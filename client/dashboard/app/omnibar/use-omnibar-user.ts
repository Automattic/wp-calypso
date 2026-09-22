import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { AUTH_QUERY_KEY, initializeCurrentUser } from '../auth';
import type { User } from '@automattic/api-core';

/**
 * The server renders `InitialOmnibar`, so the first client render must match
 * it; callers only swap in the full bar once `hydrated` is true.
 */
export function useOmnibarUser( user?: User ) {
	const [ hydrated, setHydrated ] = useState( false );
	useEffect( () => {
		setHydrated( true );
	}, [] );

	const { data: authUser } = useQuery( {
		queryKey: AUTH_QUERY_KEY,
		queryFn: initializeCurrentUser,
		initialData: user,
		enabled: hydrated,
		staleTime: 30 * 60 * 1000,
		retry: false,
		meta: { persist: false },
	} );

	return { hydrated, authUser };
}
