import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { addQueryArgs } from '@wordpress/url';
import wp from 'calypso/lib/wp';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from 'calypso/my-sites/github-deployments/constants';

export const CODE_DEPLOYMENTS_QUERY_KEY = 'code-deployments';

export interface Workflows {
	file_name: string;
}
export type WorkFlowStates = 'loading' | 'success' | 'error';

export interface WorkflowsValidationItem {
	validation_name: string;
	status: WorkFlowStates;
}

export interface WorkflowsValidation {
	conclusion: WorkFlowStates;
	checked_items: WorkflowsValidationItem[];
}

export const useDeploymentWorkflowsQuery = (
	installationId: number,
	repositoryId: number,
	branchName: string,
	deploymentStyle: string,
	options?: Partial< UseQueryOptions< Workflows[] > >
) => {
	const path = addQueryArgs( '/hosting/github/workflows', {
		installation_id: installationId,
		repository_id: repositoryId,
		branch_name: branchName,
	} );

	return useQuery< Workflows[] >( {
		queryKey: [ GITHUB_DEPLOYMENTS_QUERY_KEY, CODE_DEPLOYMENTS_QUERY_KEY, path ],
		enabled: !! installationId && !! repositoryId && !! branchName && deploymentStyle !== 'simple',
		queryFn: (): Workflows[] =>
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

export const useCheckWorkflowQuery = (
	installationId: number,
	repositoryId: number,
	branchName: string,
	workflowFilename: string
) => {
	const invalidFilenames = [ 'none', 'create-new' ];
	const path = addQueryArgs( '/hosting/github/workflows/checks', {
		installation_id: installationId,
		repository_id: repositoryId,
		branch_name: branchName,
		workflow_filename: workflowFilename,
	} );

	return useQuery< WorkflowsValidation >( {
		queryKey: [ GITHUB_DEPLOYMENTS_QUERY_KEY, CODE_DEPLOYMENTS_QUERY_KEY, path ],
		enabled: ! invalidFilenames.includes( workflowFilename ),
		queryFn: (): WorkflowsValidation =>
			wp.req.get( {
				path,
				apiNamespace: 'wpcom/v2',
			} ),
		meta: {
			persist: false,
		},
	} );
};
