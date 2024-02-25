import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { addQueryArgs } from '@wordpress/url';
import wp from 'calypso/lib/wp';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from 'calypso/my-sites/github-deployments/constants';
import { GitHubRepositoryData } from 'calypso/my-sites/github-deployments/use-github-repositories-query';

export const CODE_DEPLOYMENTS_QUERY_KEY = 'code-deployments';

export interface Workflow {
	file_name: string;
	workflow_path: string;
}

export const useDeploymentWorkflowsQuery = (
	repository: GitHubRepositoryData,
	branchName: string,
	options?: Partial< UseQueryOptions< Workflow[] > >
) => {
	const path = addQueryArgs( '/hosting/github/workflows', {
		repository_name: repository.name,
		repository_owner: repository.owner,
		branch_name: branchName,
	} );

	return useQuery< Workflow[] >( {
		queryKey: [ GITHUB_DEPLOYMENTS_QUERY_KEY, CODE_DEPLOYMENTS_QUERY_KEY, path ],
		queryFn: (): Workflow[] =>
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
