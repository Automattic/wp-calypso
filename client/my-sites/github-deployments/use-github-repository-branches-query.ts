import { useQuery } from '@tanstack/react-query';
import { addQueryArgs } from '@wordpress/url';
import wp from 'calypso/lib/wp';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from './constants';

const GITHUB_BRANCHES_QUERY_KEY = 'github-repository-branches';

export const useGithubRepositoryBranchesQuery = (
	installationId?: number,
	repositoryOwner?: string,
	repositoryName?: string
) => {
	return useQuery< string[] >( {
		queryKey: [
			GITHUB_DEPLOYMENTS_QUERY_KEY,
			GITHUB_BRANCHES_QUERY_KEY,
			installationId,
			repositoryOwner,
			repositoryName,
		],
		queryFn: (): string[] =>
			wp.req.get( {
				path: addQueryArgs( '/hosting/github/repository/branches', {
					installation_id: installationId,
					repository_owner: repositoryOwner,
					repository_name: repositoryName,
				} ),
				apiNamespace: 'wpcom/v2',
			} ),
		meta: {
			persist: false,
		},
		enabled: !! installationId,
	} );
};
