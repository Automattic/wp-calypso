import {
	fetchCodeDeployments,
	fetchCodeDeploymentRuns,
	fetchCodeDeploymentRunLogs,
	fetchCodeDeploymentRunLogDetail,
	deleteCodeDeployment,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';

export const codeDeploymentsQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'code-deployments' ],
		queryFn: () => fetchCodeDeployments( siteId ),
	} );

export const codeDeploymentRunsQuery = ( siteId: number, deploymentId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'code-deployments-runs', deploymentId ],
		queryFn: () => fetchCodeDeploymentRuns( siteId, deploymentId ),
	} );

export const codeDeploymentDeleteMutation = ( siteId: number, deploymentId: number ) =>
	mutationOptions( {
		mutationFn: ( removeFiles: boolean ) =>
			deleteCodeDeployment( siteId, deploymentId, removeFiles ),
	} );

export const deploymentRunLogsQuery = ( siteId: number, deploymentId: number, runId: number ) =>
	queryOptions( {
		queryKey: [ 'deployment-logs', siteId, deploymentId, runId ],
		queryFn: () => fetchCodeDeploymentRunLogs( siteId, deploymentId, runId ),
	} );

export const deploymentRunLogDetailQuery = (
	siteId: number,
	deploymentId: number,
	runId: number,
	commandIdentifier: string
) =>
	queryOptions( {
		queryKey: [ 'deployment-log-detail', siteId, deploymentId, runId, commandIdentifier ],
		queryFn: () =>
			fetchCodeDeploymentRunLogDetail( siteId, deploymentId, runId, commandIdentifier ),
	} );
