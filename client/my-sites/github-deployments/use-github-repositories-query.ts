import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { addQueryArgs } from '@wordpress/url';
import wp from 'calypso/lib/wp';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from './constants';

export const GITHUB_REPOSITORIES_QUERY_KEY = 'github-repositories';

export interface GitHubRepositoryData {
	full_name: string;
	id: number;
	private: boolean;
	default_branch: string;
	updated_at: string; //2011-01-26T19:06:43Z
}

export const useGithubRepositoriesQuery = (
	account?: string,
	query?: string,
	options?: UseQueryOptions< GitHubRepositoryData[] >
) => {
	const path = addQueryArgs( '/hosting/github/repositories', {
		account,
		query,
	} );

	return useQuery< GitHubRepositoryData[] >( {
		queryKey: [ GITHUB_DEPLOYMENTS_QUERY_KEY, GITHUB_REPOSITORIES_QUERY_KEY, path ],
		queryFn: (): GitHubRepositoryData[] =>
			wp.req.get( {
				path,
				apiNamespace: 'wpcom/v2',
			} ),
		meta: {
			persist: false,
		},
		...options,
	} );
};
