import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from './constants';

interface GitHubDeploymentsAvailableRequestParams {
	siteId: number;
	options?: Partial< UseQueryOptions< GitHubDeploymentsAvailableResponse > >;
}

export interface GitHubDeploymentsAvailableResponse {
	available: boolean;
}

const fetchFeatureAvailability = ( {
	siteId,
}: GitHubDeploymentsAvailableRequestParams ): GitHubDeploymentsAvailableResponse =>
	wp.req.get( {
		path: `/hosting/github/available?blog_id=${ siteId }`,
		apiNamespace: 'wpcom/v2',
	} );

export const gitHubDeploymentsAvailableQueryOptions = ( {
	siteId,
	options,
}: GitHubDeploymentsAvailableRequestParams ) => ( {
	queryKey: [ GITHUB_DEPLOYMENTS_QUERY_KEY, 'github-deployments-available', siteId ],
	queryFn: () => fetchFeatureAvailability( { siteId } ),
	retry: false,
	retryOnMount: false,
	refetchOnMount: false,
	meta: {
		persist: ( data: GitHubDeploymentsAvailableResponse | undefined ) => data?.available,
	},
	...options,
} );

export const useIsGitHubDeploymentsAvailableQuery = ( {
	siteId,
	options,
}: GitHubDeploymentsAvailableRequestParams ) => {
	return useQuery( gitHubDeploymentsAvailableQueryOptions( { siteId, options } ) );
};
