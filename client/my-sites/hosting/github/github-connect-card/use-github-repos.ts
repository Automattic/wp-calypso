import { useQuery, UseQueryOptions } from 'react-query';
import wp from 'calypso/lib/wp';

const USE_GITHUB_REPOS_QUERY_KEY = 'github-repos-query-key';

export const useGithubRepos = ( siteId: number | null, options?: UseQueryOptions< string[] > ) => {
	return useQuery< string[] >(
		[ USE_GITHUB_REPOS_QUERY_KEY, siteId ],
		(): string[] =>
			wp.req.get( {
				path: `/sites/${ siteId }/hosting/github/repos`,
				apiNamespace: 'wpcom/v2',
			} ),
		{
			enabled: !! siteId,
			meta: {
				persist: false,
			},
			refetchOnWindowFocus: false,
			...options,
		}
	);
};
