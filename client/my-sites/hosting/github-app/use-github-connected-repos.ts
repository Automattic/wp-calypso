import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wp from 'calypso/lib/wp';
import { GITHUB_INTEGRATION_QUERY_KEY } from './constants';

export const useGithubConnectedReposQuery = (
	siteId: number | null,
	connectionId: number,
	options?: UseQueryOptions< string[] >
) => {
	return useQuery< Record< string, string >[] >( {
		queryKey: [ GITHUB_INTEGRATION_QUERY_KEY, siteId, 'repos' ],
		queryFn: (): Record< string, string >[] =>
			wp.req.get( {
				path: `/sites/${ siteId }/hosting/github-app/connect`,
				apiNamespace: 'wpcom/v2',
			} ),
		enabled: !! siteId,
		meta: {
			persist: false,
		},
		refetchOnWindowFocus: false,
		...options,
	} );
};
