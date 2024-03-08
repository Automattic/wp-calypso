import { isEnabled } from '@automattic/calypso-config';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { PATTERN_CATEGORIES, getPatternSourceSiteID } from '../constants';
import type { Pattern } from '../types';

const useAssemblerPatterns = (
	lang?: string,
	queryOptions: Omit< UseQueryOptions< any, unknown, Pattern[] >, 'queryKey' > = {}
): Pattern[] => {
	const { data } = useQuery< any, unknown, Pattern[] >( {
		queryKey: [ 'pattern-assembler', lang ],
		queryFn: () => {
			return wpcomRequest( {
				path: `/ptk/patterns/${ lang }`,
				method: 'GET',
				apiVersion: '1.1',
				query: new URLSearchParams(
					isEnabled( 'pattern-assembler/v2' )
						? {
								site: getPatternSourceSiteID(),
								post_type: 'wp_block',
						  }
						: {
								tags:
									// Pages are fetched with assembler_priority.
									// There are more pages tagged with assembler_page that still aren't offered in Assembler.
									'assembler,assembler_priority',
								categories: PATTERN_CATEGORIES.join( ',' ),
								post_type: 'post',
						  }
				).toString(),
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

export default useAssemblerPatterns;
