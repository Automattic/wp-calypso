import { useQuery, UseQueryResult } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { RenderedPatterns } from '../types';

const useQueryRenderedPatterns = (
	siteId: number,
	stylesheet: string,
	patternIds: string[]
): UseQueryResult< RenderedPatterns > => {
	const pattern_ids = patternIds.join( ',' );
	const params = new URLSearchParams( {
		stylesheet,
		pattern_ids,
	} );

	return useQuery< RenderedPatterns >(
		[ siteId, 'block-renderer/patterns/render', pattern_ids ],
		() =>
			wpcomRequest( {
				apiNamespace: 'wpcom/v2',
				path: `/sites/${ encodeURIComponent( siteId ) }/block-renderer/patterns/render`,
				query: params.toString(),
			} ),
		{
			refetchOnMount: 'always',
			staleTime: Infinity,
		}
	);
};

export default useQueryRenderedPatterns;
