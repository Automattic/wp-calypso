import {
	fetchCodeDeployments,
	fetchCodeDeploymentRuns,
	deleteCodeDeployment,
	createCodeDeployment,
	CreateCodeDeploymentVariables,
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

export const createCodeDeploymentMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( variables: CreateCodeDeploymentVariables ) =>
			createCodeDeployment( siteId, variables ),
	} );
