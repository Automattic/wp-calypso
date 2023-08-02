import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { GITHUB_INTEGRATION_QUERY_KEY } from '../constants';

export type DeploymentData = {
	status: 'failed' | 'running' | 'success';
	move_failures: string[];
	remove_failures: string[];
	log_file_url: string;
	last_deployment_timestamp: number;
	last_deployment_repo: string;
	last_deployment_sha: string;
};

export const useDeploymentStatusQuery = (
	siteId: number | null,
	connectionId: number,
	options?: UseQueryOptions< DeploymentData >
) => {
	return useQuery< DeploymentData >( {
		queryKey: [ GITHUB_INTEGRATION_QUERY_KEY, siteId, connectionId, 'deployment-status' ],
		queryFn: (): DeploymentData =>
			wp.req.get( {
				path: `/sites/${ siteId }/hosting/github/deployment-status`,
				apiNamespace: 'wpcom/v2',
			} ),
		enabled: !! siteId,
		meta: {
			persist: false,
		},
		...options,
		refetchInterval: 5000,
	} );
};
