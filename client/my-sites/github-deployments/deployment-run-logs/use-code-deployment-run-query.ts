import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from '../constants';
import { CodeDeploymentData } from '../deployments/use-code-deployments-query';

export const CODE_DEPLOYMENTS_RUNS_QUERY_KEY = 'code-deployments-runs';

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

export interface DeploymentRun {
	id: number;
	code_deployment_id: number;
	created_on: string;
	started_on: string;
	completed_on: string;
	status: DeploymentRunStatus;
	failure_code: string | null;
	triggered_by_user_id: number;
	metadata: Metadata;
	code_deployment?: CodeDeploymentData;
}

export interface Metadata {
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
		meta: {
			persist: false,
		},
		refetchInterval: 5000,
		...options,
	} );
};
