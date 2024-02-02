import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { GitHubConnection } from 'calypso/my-sites/github-deployments/types';
import { GITHUB_DEPLOYMENTS_QUERY_KEY } from './constants';

export const GITHUB_CONNECTION_QUERY_KEY = 'github-connection';

export interface GithubConnectionData {
	ID: number;
	connected: boolean;
	external_profile_picture: string;
	repo: string;
	branch: string;
	base_path: string;
	label: string;
	external_name: string;
}

export const useGithubConnectionQuery = (
	siteId: number | null,
	options?: UseQueryOptions< GitHubConnection[] >
) => {
	return useQuery< GitHubConnection[] >( {
		queryKey: [ GITHUB_DEPLOYMENTS_QUERY_KEY, siteId, GITHUB_CONNECTION_QUERY_KEY ],
		queryFn: (): GitHubConnection[] =>
			wp.req.get( {
				path: `/sites/${ siteId }/hosting/github-app/connections`,
				apiNamespace: 'wpcom/v2',
			} ),
		enabled: !! siteId,
		meta: {
			persist: false,
		},
		...options,
	} );
};
