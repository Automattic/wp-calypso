import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from '../constants';
import type { DeploymentRun } from '../deployment-run-logs/use-code-deployment-run-query';

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
	workflow_path?: string; // @todo The actual value here is string | null
}

export interface CreatedBy {
	id: number;
	name: string;
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
		refetchInterval: 5000,
		...options,
	} );
};
