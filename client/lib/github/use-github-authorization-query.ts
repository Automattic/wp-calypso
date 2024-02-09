import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { deleteStoredKeyringConnection } from 'calypso/state/sharing/keyring/actions';
import { GITHUB_INTEGRATION_QUERY_KEY } from './constants';

export const GITHUB_CONNECTION_QUERY_KEY = 'github-connection';

export interface GithubConnectionData {
	ID: number;
	connected: boolean;
	external_profile_picture: string;
	label: string;
	external_name: string;
}

export type Connection = Parameters< typeof deleteStoredKeyringConnection >[ 0 ];

export const useGithubAuthorizationQuery = (
	options?: UseQueryOptions< GithubConnectionData[] >
) => {
	return useQuery( {
		queryKey: [ GITHUB_INTEGRATION_QUERY_KEY, GITHUB_CONNECTION_QUERY_KEY ],
		queryFn: (): Promise< GithubConnectionData[] > =>
			wp.req.get( {
				path: '/hosting/github-app/connections',
				apiNamespace: 'wpcom/v2',
			} ),
		meta: {
			persist: false,
		},
		...options,
	} );
};
