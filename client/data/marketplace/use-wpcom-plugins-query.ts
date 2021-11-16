import { useQuery, UseQueryResult, QueryKey } from 'react-query';
import wpcom from 'calypso/lib/wp';

interface Options {
	enabled?: boolean;
	staleTime?: number;
	refetchOnMount?: boolean;
}

type Type = 'all' | 'featured';

export const getCacheKey = ( type: Type ): QueryKey => [ 'wpcom-plugins', type ];

const useWPCOMPlugins = (
	type: Type,
	{ enabled = true, staleTime = 1000 * 60 * 60 * 24, refetchOnMount = false }: Options = {}
): UseQueryResult => {
	return useQuery( getCacheKey( type ), () => fetchWPCOMPlugins( type ), {
		enabled: enabled,
		staleTime: staleTime,
		refetchOnMount: refetchOnMount,
	} );
};

export function fetchWPCOMPlugins( type: Type ) {
	const query = {
		type: type,
	};

	return wpcom.req.get(
		{
			path: `/marketplace/products`,
			apiNamespace: 'wpcom/v2',
		},
		query
	);
}

export default useWPCOMPlugins;
