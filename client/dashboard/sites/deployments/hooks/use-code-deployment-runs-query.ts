import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';

export const CODE_DEPLOYMENTS_RUNS_QUERY_KEY = 'code-deployments-runs';
export const GITHUB_DEPLOYMENTS_QUERY_KEY = 'github-deployments';

export type DeploymentRunStatus =
	| 'pending'
	| 'queued'
	| 'running'
	| 'success'
	| 'failed'
	| 'warnings'
	| 'building'
	| 'dispatched'
	| 'unknown';

export interface DeploymentRunMetadata {
	commit_message: string;
	commit_sha: string;
	job_id: number;
	author: {
		avatar_url: string;
		id: number;
		name: string;
		profile_url: string;
	};
}

export interface DeploymentRun {
	id: number;
	code_deployment_id: number;
	created_on: string;
	started_on: string;
	completed_on: string;
	status: DeploymentRunStatus;
	failure_code: string | null;
	triggered_by_user_id: number;
	metadata: DeploymentRunMetadata;
}

export interface DeploymentRunWithDeploymentInfo extends DeploymentRun {
	repository_name: string;
	branch_name: string;
	is_automated: boolean;
	is_active_deployment: boolean;
}

export const useCodeDeploymentsRunsQuery = (
	siteId: number | null,
	deploymentId: number,
	options?: UseQueryOptions< DeploymentRun[] >
) => {
	return useQuery< DeploymentRun[] >( {
		enabled: !! siteId,
		queryKey: [
			GITHUB_DEPLOYMENTS_QUERY_KEY,
			CODE_DEPLOYMENTS_RUNS_QUERY_KEY,
			siteId,
			deploymentId,
		],
		queryFn: (): DeploymentRun[] =>
			wp.req.get( {
				path: `/sites/${ siteId }/hosting/code-deployments/${ deploymentId }/runs`,
				apiNamespace: 'wpcom/v2',
			} ),
		...options,
	} );
};
