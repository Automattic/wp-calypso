import { useQuery, UseQueryOptions } from 'react-query';
import wp from 'calypso/lib/wp';

export const USE_GITHUB_REPOS_QUERY_KEY = 'github-connection-query-key';

export type InactiveGitHubConnection = {
	connected: boolean;
};

export type GitHubConnection = {
	ID: number;
	base_path: string;
	repo: string;
	branch: string;
	external_profile_picture: string;
	external_name: string;
	label: string;
} & InactiveGitHubConnection;

export const useGithubConnection = (
	siteId: number | null,
	options?: UseQueryOptions< GitHubConnection >
) => {
	return useQuery< GitHubConnection >(
		[ USE_GITHUB_REPOS_QUERY_KEY, siteId ],
		(): GitHubConnection =>
			wp.req.get( {
				path: `/sites/${ siteId }/hosting/github/connection`,
				apiNamespace: 'wpcom/v2',
			} ),
		{
			enabled: !! siteId,
			meta: {
				persist: true,
			},
			refetchOnWindowFocus: false,
			...options,
		}
	);
};
