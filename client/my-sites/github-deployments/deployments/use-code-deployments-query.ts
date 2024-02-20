import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { CodeDeploymentData } from 'calypso/my-sites/github-deployments/deployment-management/use-code-deployment-query';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from '../constants';

export const CODE_DEPLOYMENTS_QUERY_KEY = 'code-deployments';

export interface CodeDeploymentData {
	id: number;
	blog_id: number;
	created_by_user_id: number;
	created_on: string;
	updated_on: string;
	external_repository_id: number;
	repository_name: string;
	branch_name: string;
	target_dir: string;
	is_automated: boolean;
	installation_id: number;
	created_by: CreatedBy;
	current_deployed_run?: DeploymentRun;
	current_deployment_run?: DeploymentRun;
	workflow_path: string;
}

export interface CreatedBy {
	id: number;
	name: string;
}

export interface DeploymentRun {
	id: number;
	code_deployment_id: number;
	created_on: string;
	started_on: string;
	completed_on: string;
	status: string;
	failure_code: string;
	triggered_by_user_id: number;
	metadata: Metadata;
	code_deployment?: CodeDeploymentData;
}

export interface Metadata {
	commit_message: string;
	commit_sha: string;
	job_id: number;
}

export const useCodeDeploymentsQuery = (
	siteId: number | null,
	options?: UseQueryOptions< CodeDeploymentData[] >
) => {
	return useQuery< CodeDeploymentData[] >( {
		enabled: !! siteId,
		queryKey: [ GITHUB_DEPLOYMENTS_QUERY_KEY, CODE_DEPLOYMENTS_QUERY_KEY, siteId ],
		queryFn: (): CodeDeploymentData[] =>
			wp.req.get( {
				path: `/sites/${ siteId }/hosting/code-deployments`,
				apiNamespace: 'wpcom/v2',
			} ),
		meta: {
			persist: false,
		},
		...options,
	} );
};
