import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { GITHUB_INTEGRATION_QUERY_KEY } from './constants';

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
	options?: UseQueryOptions< GithubConnectionData >
) => {
	return useQuery< GithubConnectionData >( {
		queryKey: [ GITHUB_INTEGRATION_QUERY_KEY, siteId, GITHUB_CONNECTION_QUERY_KEY ],
		queryFn: (): GithubConnectionData =>
			wp.req.get( {
				path: `/sites/${ siteId }/hosting/github/connection`,
				apiNamespace: 'wpcom/v2',
			} ),
		enabled: !! siteId,
		meta: {
			persist: false,
		},
		...options,
	} );
};
