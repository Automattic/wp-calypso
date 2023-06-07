import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { Pattern } from '../types';

const useDotcomPatterns = (
	lang?: string,
	queryOptions: UseQueryOptions< any, unknown, Pattern[] > = {}
): Pattern[] => {
	const { data } = useQuery< any, unknown, Pattern[] >( {
		queryKey: [ lang, 'patterns' ],
		queryFn: () => {
			return wpcomRequest( {
				path: `/ptk/patterns/${ lang }`,
				method: 'GET',
				apiVersion: '1.1',
				query: new URLSearchParams( {
					tags: 'pattern',
					pattern_meta: 'is_web',
				} ).toString(),
			} );
		},
		...queryOptions,
		staleTime: Infinity,
		enabled: !! lang,
		meta: {
			persist: false,
			...queryOptions.meta,
		},
	} );

	return data ?? [];
};

export default useDotcomPatterns;
