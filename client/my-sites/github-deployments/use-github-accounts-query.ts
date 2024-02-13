import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from './constants';

export const GITHUB_ACCOUNTS_QUERY_KEY = 'github-accounts';

export interface GitHubAccountData {
	account_name: string;
	external_id: number;
	external_name: string;
}

export const useGithubAccountsQuery = ( options?: UseQueryOptions< GitHubAccountData[] > ) => {
	return useQuery< GitHubAccountData[] >( {
		queryKey: [ GITHUB_DEPLOYMENTS_QUERY_KEY, GITHUB_ACCOUNTS_QUERY_KEY ],
		queryFn: (): GitHubAccountData[] =>
			wp.req.get( {
				path: `/hosting/github/accounts`,
				apiNamespace: 'wpcom/v2',
			} ),
		meta: {
			persist: false,
		},
		...options,
	} );
};
