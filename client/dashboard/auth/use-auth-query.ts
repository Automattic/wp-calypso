import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

export const AUTH_QUERY_KEY = [ 'auth', 'user' ];

export interface User {
	ID: number;
	username: string;
	displayName: string;
	email: string;
	avatar_URL: string;
	profile_URL: string;
	isDeveloper: boolean;
	siteAddress: string;
	aboutMe: string;
}

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
