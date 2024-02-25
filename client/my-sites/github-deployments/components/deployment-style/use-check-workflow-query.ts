import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { addQueryArgs } from '@wordpress/url';
import wp from 'calypso/lib/wp';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from 'calypso/my-sites/github-deployments/constants';
import { GitHubRepositoryData } from 'calypso/my-sites/github-deployments/use-github-repositories-query';

export const CODE_DEPLOYMENTS_QUERY_KEY = 'code-deployments';

export type WorkFlowStates = 'loading' | 'success' | 'error';

export interface WorkflowsValidationItem {
	validation_name: string;
	status: WorkFlowStates;
}

export interface WorkflowsValidation {
	conclusion: WorkFlowStates;
	checked_items: WorkflowsValidationItem[];
}

interface CheckWorkflowQueryParams {
	repository: GitHubRepositoryData;
	branchName: string;
	workflowFilename?: string;
}

export const useCheckWorkflowQuery = (
	{ repository, branchName, workflowFilename }: CheckWorkflowQueryParams,
	options?: Partial< UseQueryOptions< WorkflowsValidation > >
) => {
	return useQuery< WorkflowsValidation >( {
		queryKey: [
			GITHUB_DEPLOYMENTS_QUERY_KEY,
			CODE_DEPLOYMENTS_QUERY_KEY,
			repository.name,
			repository.owner,
			branchName,
			workflowFilename,
		],
		queryFn: (): WorkflowsValidation => {
			const path = addQueryArgs( '/hosting/github/workflows/checks', {
				repository_name: repository.name,
				repository_owner: repository.owner,
				branch_name: branchName,
				workflow_filename: workflowFilename,
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
