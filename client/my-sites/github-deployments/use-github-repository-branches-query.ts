import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from './constants';

export const GITHUB_ACCOUNTS_QUERY_KEY = 'github-repository-branches';

export const useGithubRepositoryBranchesQuery = (
	repository: string,
	options?: UseQueryOptions< string[] >
) => {
	return useQuery< string[] >( {
		queryKey: [ GITHUB_DEPLOYMENTS_QUERY_KEY, GITHUB_ACCOUNTS_QUERY_KEY, repository ],
		queryFn: (): string[] =>
			wp.req.get( {
				path: `/hosting/github/repository/branches?repository=${ repository }`,
				apiNamespace: 'wpcom/v2',
			} ),
		meta: {
			persist: false,
		},
		...options,
	} );
};
