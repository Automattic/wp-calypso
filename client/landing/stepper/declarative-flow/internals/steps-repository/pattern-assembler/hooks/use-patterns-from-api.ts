import { useQuery, UseQueryResult, UseQueryOptions } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';

const usePatternsFromAPI = (
	siteId: number | undefined,
	queryOptions: UseQueryOptions< unknown, unknown, unknown > = {}
): UseQueryResult => {
	const params = new URLSearchParams( {} );

	return useQuery< any, unknown, unknown >(
		[ siteId, 'block-patterns', 'patterns' ],
		() => {
			if ( ! siteId ) {
				return [];
			}

			return wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteId ) }/block-patterns/patterns`,
				method: 'GET',
				apiNamespace: 'wp/v2',
				query: params.toString(),
			} );
		},
		{
			...queryOptions,
			staleTime: Infinity,
			meta: {
				persist: false,
				...queryOptions.meta,
			},
		}
	);
};

export default usePatternsFromAPI;
