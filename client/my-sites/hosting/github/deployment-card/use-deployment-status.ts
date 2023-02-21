import { useQuery, UseQueryOptions } from 'react-query';
import wp from 'calypso/lib/wp';

export type DeploymentData = {
	status: 'failed' | 'running' | 'success';
	move_failures: string[];
	remove_failures: string[];
	log_file_url: string;
	last_deployment_timestamp: number;
	last_deployment_sha: string;
};

const USE_DEPLOYMENT_STATUS_QUERY_KEY = 'deployment-status-query-key';

export const useDeploymentStatus = (
	siteId: number | null,
	options?: UseQueryOptions< DeploymentData >
) => {
	return useQuery< DeploymentData >(
		[ USE_DEPLOYMENT_STATUS_QUERY_KEY, siteId ],
		(): DeploymentData =>
			wp.req.get( {
				path: `/sites/${ siteId }/hosting/github/deployment-status`,
				apiNamespace: 'wpcom/v2',
			} ),
		{
			enabled: !! siteId,
			meta: {
				persist: false,
			},
			refetchOnWindowFocus: false,
			...options,
			refetchInterval: 5000,
		}
	);
};
