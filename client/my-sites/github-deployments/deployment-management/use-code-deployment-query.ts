import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from '../constants';
import { CodeDeploymentData } from '../deployments/use-code-deployments-query';

export const CODE_DEPLOYMENTS_QUERY_KEY = 'code-deployments';

export const useCodeDeploymentQuery = (
	siteId: number | null,
	deploymentId: number,
	options?: UseQueryOptions< CodeDeploymentData >
) => {
	return useQuery< CodeDeploymentData >( {
		enabled: !! siteId,
		queryKey: [ GITHUB_DEPLOYMENTS_QUERY_KEY, CODE_DEPLOYMENTS_QUERY_KEY, siteId, deploymentId ],
		queryFn: (): CodeDeploymentData =>
			wp.req.get( {
				path: `/sites/${ siteId }/hosting/code-deployments/${ deploymentId }`,
				apiNamespace: 'wpcom/v2',
			} ),
		meta: {
			persist: false,
		},
		...options,
	} );
};
