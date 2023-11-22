import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { GITHUB_INTEGRATION_QUERY_KEY } from '../constants';

const CACHE_TIME = 1000 * 60 * 5; // 5 mins

const sortBranches = ( a: string, b: string ): number => {
	if ( a.includes( 'master' ) || a.includes( 'main' ) || a.includes( 'trunk' ) ) {
		return -1;
	} else if ( b.includes( 'master' ) || b.includes( 'main' ) || b.includes( 'trunk' ) ) {
		return 1;
	}
	return a.localeCompare( b );
};

export const useGithubBranchesQuery = (
	siteId: number | null,
	repoName: string | undefined,
	connectionId: number,
	options?: UseQueryOptions< string[] >
) => {
	return useQuery< string[] >( {
		queryKey: [ GITHUB_INTEGRATION_QUERY_KEY, siteId, connectionId, 'branches', repoName ],
		queryFn: (): string[] =>
			wp.req.get( {
				path: `/sites/${ siteId }/hosting/github/branches?repo=${ repoName }`,
				apiNamespace: 'wpcom/v2',
			} ),
		enabled: !! siteId && !! repoName,
		select: ( data ) => data.sort( sortBranches ),
		meta: {
			persist: false,
		},
		...options,
		gcTime: CACHE_TIME,
	} );
};
