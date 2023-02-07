import { useQuery, UseQueryOptions } from 'react-query';
import wp from 'calypso/lib/wp';

const USE_GITHUB_BRANCHES_QUERY_KEY = 'github-branches-query-key';
const CACHE_TIME = 1000 * 60 * 5; // 5 mins
export type RepoBranch = {
	name: string;
};

export const useGithubBranches = (
	siteId: number | null,
	repoName: string | undefined,
	options?: UseQueryOptions< RepoBranch[] >
) => {
	return useQuery< RepoBranch[] >(
		[ USE_GITHUB_BRANCHES_QUERY_KEY, repoName, siteId ],
		(): RepoBranch[] =>
			wp.req.get( {
				path: `/sites/${ siteId }/hosting/github/branches?repo=${ repoName }`,
				apiNamespace: 'wpcom/v2',
			} ),
		{
			enabled: !! siteId && !! repoName,
			select: ( data ) =>
				data.map( ( branch: RepoBranch ) => ( {
					name: branch.name,
				} ) ),
			meta: {
				persist: false,
			},
			...options,
			cacheTime: CACHE_TIME,
		}
	);
};
