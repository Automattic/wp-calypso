import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { addQueryArgs } from 'calypso/lib/url';
import wp from 'calypso/lib/wp';
import { GITHUB_INTEGRATION_QUERY_KEY } from '../constants';

export const useGithubReposQuery = (
	siteId: number | null,
	query: string,
	connectionId: number,
	options?: UseQueryOptions< string[] >
) => {
	return useQuery< string[] >( {
		queryKey: [ GITHUB_INTEGRATION_QUERY_KEY, siteId, connectionId, 'repos', query ],
		queryFn: (): string[] =>
			wp.req.get( {
				path: addQueryArgs( { query }, `/sites/${ siteId }/hosting/github/repos` ),
				apiNamespace: 'wpcom/v2',
			} ),
		enabled: !! siteId && !! query,
		meta: {
			persist: false,
		},
		refetchOnWindowFocus: false,
		...options,
	} );
};
