import { useQuery, UseQueryOptions } from 'react-query';
import { addQueryArgs } from 'calypso/lib/url';
import wp from 'calypso/lib/wp';

const USE_GITHUB_REPOS_QUERY_KEY = 'github-repos-query-key';

export const useGithubRepos = (
	siteId: number | null,
	query: string,
	options?: UseQueryOptions< string[] >
) => {
	return useQuery< string[] >(
		[ USE_GITHUB_REPOS_QUERY_KEY, siteId, query ],
		(): string[] =>
			wp.req.get( {
				path: addQueryArgs( { query }, `/sites/${ siteId }/hosting/github/repos` ),
				apiNamespace: 'wpcom/v2',
			} ),
		{
			enabled: !! siteId && !! query,
			meta: {
				persist: false,
			},
			refetchOnWindowFocus: false,
			...options,
		}
	);
};
