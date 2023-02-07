import { useQuery, UseQueryOptions } from 'react-query';
import wp from 'calypso/lib/wp';

const USE_GITHUB_REPOS_QUERY_KEY = 'github-repos-query-key';

export interface Repo {
	name: string;
	full_name: string;
}

export const useGithubRepos = ( siteId: number | null, options?: UseQueryOptions< Repo[] > ) => {
	return useQuery< Repo[] >(
		[ USE_GITHUB_REPOS_QUERY_KEY, siteId ],
		(): Repo[] =>
			wp.req.get( {
				path: `/sites/${ siteId }/hosting/github/repos`,
				apiNamespace: 'wpcom/v2',
			} ),
		{
			enabled: !! siteId,
			select: ( data ) =>
				data.map( ( repo: Repo ) => ( {
					name: repo.name,
					full_name: repo.full_name,
				} ) ),
			meta: {
				persist: false,
			},
			...options,
		}
	);
};
