import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from './constants';

const fetchAccounts = (): GitHubAccountData[] =>
	wp.req.get( {
		path: `/hosting/github/accounts`,
		apiNamespace: 'wpcom/v2',
	} );

const GITHUB_DEPLOYMENTS_ACCOUNTS_QUERY_KEY = [ GITHUB_DEPLOYMENTS_QUERY_KEY, 'github-accounts' ];

export interface GitHubAccountData {
	account_name: string;
	external_id: number;
	external_name: string;
}

export const useGithubAccountsQuery = (
	options?: Partial< UseQueryOptions< GitHubAccountData[] > >
) => {
	return useQuery< GitHubAccountData[] >( {
		queryKey: GITHUB_DEPLOYMENTS_ACCOUNTS_QUERY_KEY,
		queryFn: fetchAccounts,
		retry: false,
		retryOnMount: false,
		refetchOnMount: false,
		meta: { persist: false },
		...options,
	} );
};
