import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { addQueryArgs } from '@wordpress/url';
import wp from 'calypso/lib/wp';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from '../../constants';
import { GitHubRepositoryData } from '../../use-github-repositories-query';

export const CODE_DEPLOYMENTS_QUERY_KEY = 'code-deployments';

export interface Workflow {
	file_name: string;
	workflow_path: string;
}

const childWorkflows = [ 'lint-css.yml', 'lint-js.yml', 'lint-php.yml' ];

export const useDeploymentWorkflowsQuery = (
	repository: Pick< GitHubRepositoryData, 'owner' | 'name' > | undefined,
	branchName: string,
	options?: Partial< UseQueryOptions< Workflow[] > >
) => {
	const path = addQueryArgs( '/hosting/github/workflows', {
		repository_name: repository?.name,
		repository_owner: repository?.owner,
		branch_name: branchName,
	} );

	return useQuery< Workflow[] >( {
		queryKey: [ GITHUB_DEPLOYMENTS_QUERY_KEY, CODE_DEPLOYMENTS_QUERY_KEY, path ],
		queryFn: (): Workflow[] =>
			wp.req.get( {
				path,
				apiNamespace: 'wpcom/v2',
			} ),
		select: ( workflows: Workflow[] ) =>
			workflows.filter( ( workflow ) => ! childWorkflows.includes( workflow.file_name ) ),
		meta: {
			persist: false,
		},
		enabled: !! repository,
		...options,
	} );
};
