import { useQuery, UseQueryOptions } from 'react-query';
import wp from 'calypso/lib/wp';

const USE_GITHUB_CONNECTION_QUERY_KEY = 'github-connection-query-key';
type GithubConnectionData = {
	ID: number;
	connected: boolean;
	external_profile_picture: string;
	repo: string;
	branch: string;
	base_path: string;
	label: string;
	external_name: string;
};
export const useGithubConnection = (
	siteId: number | null,
	options?: UseQueryOptions< GithubConnectionData >
) => {
	return useQuery< GithubConnectionData >(
		[ USE_GITHUB_CONNECTION_QUERY_KEY, siteId ],
		(): GithubConnectionData =>
			wp.req.get( {
				path: `/sites/${ siteId }/hosting/github/connection`,
				apiNamespace: 'wpcom/v2',
			} ),
		{
			enabled: !! siteId,
			meta: {
				persist: false,
			},
			...options,
		}
	);
};
