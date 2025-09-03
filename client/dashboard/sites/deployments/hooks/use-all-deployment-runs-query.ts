import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import {
	DeploymentRun,
	DeploymentRunWithDeploymentInfo,
	CODE_DEPLOYMENTS_RUNS_QUERY_KEY,
} from './use-code-deployment-runs-query';
import { useCodeDeploymentsQuery } from './use-code-deployments-query';

const GITHUB_DEPLOYMENTS_QUERY_KEY = 'github-deployments';

export const useAllDeploymentRunsQuery = (
	siteId: number | null,
	options?: UseQueryOptions< DeploymentRunWithDeploymentInfo[] >
) => {
	// First get all deployments
	const {
		data: deployments = [],
		isLoading: deploymentsLoading,
		error: deploymentsError,
	} = useCodeDeploymentsQuery( siteId );

	// Create a single query that fetches all deployment runs for all deployments
	const {
		data: allRuns,
		isLoading: runsLoading,
		error: runsError,
		refetch,
	} = useQuery< DeploymentRunWithDeploymentInfo[] >( {
		enabled: !! siteId && deployments.length > 0,
		queryKey: [
			GITHUB_DEPLOYMENTS_QUERY_KEY,
			CODE_DEPLOYMENTS_RUNS_QUERY_KEY,
			'all-runs',
			siteId,
			deployments.map( ( d ) => d.id ).sort(),
		],
		queryFn: async (): Promise< DeploymentRunWithDeploymentInfo[] > => {
			const allRunsPromises = deployments.map( async ( deployment ) => {
				const runs: DeploymentRun[] = await wp.req.get( {
					path: `/sites/${ siteId }/hosting/code-deployments/${ deployment.id }/runs`,
					apiNamespace: 'wpcom/v2',
				} );

				return runs.map( ( run ) => {
					// Find the most recent deployment run for this deployment to mark as active
					const isActiveDeployment =
						deployment.current_deployment_run?.id === run.id ||
						( ! deployment.current_deployment_run &&
							deployment.current_deployed_run?.id === run.id );

					return {
						...run,
						repository_name: deployment.repository_name,
						branch_name: deployment.branch_name,
						is_automated: deployment.is_automated,
						is_active_deployment: isActiveDeployment,
					};
				} );
			} );

			const allRunsArrays = await Promise.all( allRunsPromises );
			const flattenedRuns = allRunsArrays.flat();

			// Sort by created_on descending (most recent first)
			return flattenedRuns.sort(
				( a, b ) => new Date( b.created_on ).getTime() - new Date( a.created_on ).getTime()
			);
		},
		refetchInterval: ( query ) => {
			const { data } = query.state;
			const hasActiveRuns = data?.some(
				( run ) => run.status === 'pending' || run.status === 'queued' || run.status === 'running'
			);
			return hasActiveRuns ? 5000 : false;
		},
		...options,
	} );

	const isLoading = deploymentsLoading || runsLoading;
	const error = deploymentsError || runsError;

	return {
		data: allRuns,
		isLoading,
		error,
		refetch,
	};
};
