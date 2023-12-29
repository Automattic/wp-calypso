import { isEnabled } from '@automattic/calypso-config';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import {
	PATTERN_CATEGORIES,
	PATTERN_CATEGORIES_FOR_QUERY,
	getPatternSourceSiteID,
} from '../constants';
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
				query: new URLSearchParams(
					isEnabled( 'pattern-assembler/v2' )
						? {
								site: getPatternSourceSiteID(),
								post_type: 'wp_block',
								categories: PATTERN_CATEGORIES_FOR_QUERY.join( ',' ),
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

export default useDotcomPatterns;
