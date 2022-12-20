import { useQuery, UseQueryResult, UseQueryOptions } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';

const useQueryBlockSettings = (
	siteId: number,
	stylesheet: string,
	queryOptions: UseQueryOptions< unknown, unknown, unknown > = {}
): UseQueryResult< unknown > => {
	const params = new URLSearchParams( {
		stylesheet,
	} );

	return useQuery< any, unknown, unknown >(
		[ siteId, 'block-renderer' ],
		() =>
			wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteId ) }/block-renderer/settings`,
				method: 'GET',
				apiNamespace: 'wpcom/v2',
				query: params.toString(),
			} ),
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

export default useQueryBlockSettings;
