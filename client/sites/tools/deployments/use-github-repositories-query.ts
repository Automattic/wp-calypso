import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { addQueryArgs } from '@wordpress/url';
import wp from 'calypso/lib/wp';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from './constants';

export const GITHUB_REPOSITORIES_QUERY_KEY = 'github-repositories';

export interface GitHubRepositoryData {
	owner: string;
	name: string;
	id: number;
	private: boolean;
	default_branch: string;
	updated_at: string; //2011-01-26T19:06:43Z
}

export const useGithubRepositoriesQuery = (
	installationId: number,
	options?: UseQueryOptions< GitHubRepositoryData[] >
) => {
	return useQuery< GitHubRepositoryData[] >( {
		queryKey: [ GITHUB_DEPLOYMENTS_QUERY_KEY, GITHUB_REPOSITORIES_QUERY_KEY, installationId ],
		queryFn: (): GitHubRepositoryData[] => {
			const path = addQueryArgs( '/hosting/github/repositories', {
				installation_id: installationId,
			} );

			return wp.req.get( {
				path,
				apiNamespace: 'wpcom/v2',
			} );
		},
		meta: {
			persist: false,
		},
		...options,
	} );
};
