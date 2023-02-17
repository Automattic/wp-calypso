import { useQuery, UseQueryOptions } from 'react-query';
import wp from 'calypso/lib/wp';

const USE_GITHUB_BRANCHES_QUERY_KEY = 'github-branches-query-key';
const CACHE_TIME = 1000 * 60 * 5; // 5 mins

const sortBranches = ( a: string, b: string ): number => {
	if ( a.includes( 'master' ) || a.includes( 'main' ) || a.includes( 'trunk' ) ) {
		return -1;
	} else if ( b.includes( 'master' ) || b.includes( 'main' ) || b.includes( 'trunk' ) ) {
		return 1;
	}
	return a.localeCompare( b );
};

export const useGithubBranches = (
	siteId: number | null,
	repoName: string | undefined,
	options?: UseQueryOptions< string[] >
) => {
	return useQuery< string[] >(
		[ USE_GITHUB_BRANCHES_QUERY_KEY, repoName, siteId ],
		(): string[] =>
			wp.req.get( {
				path: `/sites/${ siteId }/hosting/github/branches?repo=${ repoName }`,
				apiNamespace: 'wpcom/v2',
			} ),
		{
			enabled: !! siteId && !! repoName,
			select: ( data ) => data.sort( sortBranches ),
			meta: {
				persist: false,
			},
			refetchOnWindowFocus: false,
			...options,
			cacheTime: CACHE_TIME,
		}
	);
};
