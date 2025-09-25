import {
	fetchCodeDeployments,
	fetchCodeDeploymentRuns,
	createCodeDeploymentRun,
	fetchCodeDeploymentRunLogs,
	fetchCodeDeploymentRunLogDetail,
	deleteCodeDeployment,
	createCodeDeployment,
	CreateCodeDeploymentVariables,
} from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

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

export const createCodeDeploymentRunMutation = () =>
	mutationOptions( {
		mutationFn: async ( { siteId, deploymentId }: { siteId: number; deploymentId: number } ) =>
			createCodeDeploymentRun( siteId, deploymentId ),
		onSuccess: ( ...args ) => {
			const [ , variables ] = args;

			queryClient.invalidateQueries(
				codeDeploymentRunsQuery( variables.siteId, variables.deploymentId )
			);
		},
	} );

export const codeDeploymentDeleteMutation = ( siteId: number, deploymentId: number ) =>
	mutationOptions( {
		mutationFn: ( removeFiles: boolean ) =>
			deleteCodeDeployment( siteId, deploymentId, removeFiles ),
	} );

export const createCodeDeploymentMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( variables: CreateCodeDeploymentVariables ) =>
			createCodeDeployment( siteId, variables ),
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
