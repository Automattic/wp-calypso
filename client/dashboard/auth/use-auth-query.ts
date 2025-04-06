import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { User } from '../data/types';

export const AUTH_QUERY_KEY = [ 'auth', 'user' ];

const fetchUser = async (): Promise< User > => {
	return await wpcom.me().get();
};

export function useAuthQuery() {
	return useQuery( {
		queryKey: AUTH_QUERY_KEY,
		queryFn: fetchUser,
		staleTime: 30 * 60 * 1000, // Consider auth valid for 30 minutes
		retry: false, // Don't retry on 401 errors
	} );
}
