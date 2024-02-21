import { useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from './constants';

interface GitHubDeploymentsAvailableRequestParams {
	siteId: number;
}

export interface GitHubDeploymentsAvailableResponse {
	available: boolean;
}

const fetchFeatureAvailability = ( {
	siteId,
}: GitHubDeploymentsAvailableRequestParams ): GitHubDeploymentsAvailableResponse =>
	wp.req.get( {
		path: `/sites/${ siteId }/hosting/github/available`,
		apiNamespace: 'wpcom/v2',
	} );

export const gitHubDeploymentsAvailableQueryOptions = ( {
	siteId,
}: GitHubDeploymentsAvailableRequestParams ) => ( {
	queryKey: [ GITHUB_DEPLOYMENTS_QUERY_KEY, 'github-deployments-available', siteId ],
	queryFn: () => fetchFeatureAvailability( { siteId } ),
	retry: false,
	retryOnMount: false,
	refetchOnMount: false,
	meta: {
		persist: ( data: GitHubDeploymentsAvailableResponse | undefined ) => data?.available,
	},
} );

export const useIsGitHubDeploymentsAvailableQuery = ( {
	siteId,
}: GitHubDeploymentsAvailableRequestParams ) => {
	return useQuery( gitHubDeploymentsAvailableQueryOptions( { siteId } ) );
};
