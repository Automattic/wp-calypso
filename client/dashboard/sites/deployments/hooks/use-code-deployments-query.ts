import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

export const CODE_DEPLOYMENTS_QUERY_KEY = 'code-deployments';
export const GITHUB_DEPLOYMENTS_QUERY_KEY = 'github-deployments';

export interface DeploymentRun {
	id: number;
	status: string;
	created_on: string;
	updated_on: string;
	finished_on?: string;
	failure_code?: string;
	metadata?: {
		commit_message: string;
		commit_sha: string;
		author: {
			avatar_url: string;
			id: number;
			name: string;
			profile_url: string;
		};
	};
}

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
	created_by: {
		id: number;
		name: string;
	};
	current_deployed_run?: DeploymentRun;
	current_deployment_run?: DeploymentRun;
	workflow_path?: string;
}

export const useCodeDeploymentsQuery = (
	siteId: number | null,
	options?: UseQueryOptions< CodeDeploymentData[] >
) => {
	return useQuery< CodeDeploymentData[] >( {
		enabled: !! siteId,
		queryKey: [ GITHUB_DEPLOYMENTS_QUERY_KEY, CODE_DEPLOYMENTS_QUERY_KEY, siteId ],
		queryFn: (): Promise< CodeDeploymentData[] > =>
			wp.req.get( {
				path: `/sites/${ siteId }/hosting/code-deployments`,
				apiNamespace: 'wpcom/v2',
			} ),
		...options,
	} );
};
