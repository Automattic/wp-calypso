import { useQuery, UseQueryResult } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { RenderedPattern } from '../types';

const useQueryRenderedPatterns = (
	siteId: number,
	stylesheet: string,
	patternIds: string[]
): UseQueryResult< RenderedPattern[] > => {
	const pattern_ids = patternIds.join( ',' );
	const params = new URLSearchParams( {
		stylesheet,
		pattern_ids,
	} );

	return useQuery< RenderedPattern[] >(
		[ siteId, 'block-patterns', pattern_ids ],
		() =>
			wpcomRequest( {
				apiNamespace: 'wpcom/v2',
				path: `/sites/${ encodeURIComponent( siteId ) }/block-patterns/render`,
				query: params.toString(),
			} ),
		{
			refetchOnMount: 'always',
			staleTime: Infinity,
		}
	);
};

export default useQueryRenderedPatterns;
