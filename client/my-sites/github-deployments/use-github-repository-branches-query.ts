import { useQuery } from '@tanstack/react-query';
import { addQueryArgs } from '@wordpress/url';
import wp from 'calypso/lib/wp';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from './constants';

export const GITHUB_ACCOUNTS_QUERY_KEY = 'github-repository-branches';

export const useGithubRepositoryBranchesQuery = (
	installation_id: number,
	repository_owner: string,
	repository_name: string
) => {
	return useQuery< string[] >( {
		queryKey: [
			GITHUB_DEPLOYMENTS_QUERY_KEY,
			GITHUB_ACCOUNTS_QUERY_KEY,
			installation_id,
			repository_owner,
			repository_name,
		],
		queryFn: (): string[] =>
			wp.req.get( {
				path: addQueryArgs( '/hosting/github/repository/branches', {
					installation_id,
					repository_owner,
					repository_name,
				} ),
				apiNamespace: 'wpcom/v2',
			} ),
		meta: {
			persist: false,
		},
	} );
};
