import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { PATTERN_CATEGORIES } from '../constants';
import type { Pattern } from '../types';

const useDotcomPatterns = (
	lang?: string,
	queryOptions: Omit< UseQueryOptions< any, unknown, Pattern[] >, 'queryKey' > = {}
): Pattern[] => {
	const { data } = useQuery< any, unknown, Pattern[] >( {
		queryKey: [ lang, 'patterns' ],
		queryFn: () => {
			return wpcomRequest( {
				path: `/ptk/patterns/${ lang }`,
				method: 'GET',
				apiVersion: '1.1',
				query: new URLSearchParams( {
					tags: 'assembler,assembler_priority',
					categories: PATTERN_CATEGORIES.join( ',' ),
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
