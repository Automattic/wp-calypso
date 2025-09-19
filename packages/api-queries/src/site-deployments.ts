import {
	fetchCodeDeployments,
	fetchCodeDeploymentRuns,
	createCodeDeploymentRun,
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
