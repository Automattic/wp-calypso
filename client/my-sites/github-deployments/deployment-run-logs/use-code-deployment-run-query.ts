import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { DeploymentRun } from 'calypso/my-sites/github-deployments/deployments/use-code-deployments-query';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from '../constants';

export const CODE_DEPLOYMENTS_RUNS_sQUERY_KEY = 'code-deployments-runs';

export const useCodeDeploymentsRunsQuery = (
	siteId: number | null,
	deploymentId: number,
	options?: UseQueryOptions< DeploymentRun[] >
) => {
	return useQuery< DeploymentRun >( {
		enabled: !! siteId,
		queryKey: [
			GITHUB_DEPLOYMENTS_QUERY_KEY,
			CODE_DEPLOYMENTS_RUNS_sQUERY_KEY,
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
		...options,
	} );
};
