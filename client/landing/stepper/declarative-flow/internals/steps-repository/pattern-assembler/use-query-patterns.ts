import { useQuery, UseQueryResult } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import { encodePatternId } from './utils';
import type { Pattern } from './types';

const useQueryPatterns = (
	siteId: number,
	stylesheet: string,
	patternIds: number[]
): UseQueryResult< Pattern[] > => {
	const pattern_ids = patternIds.map( ( patternId ) => encodePatternId( patternId ) ).join( ',' );
	const params = new URLSearchParams( {
		stylesheet,
		pattern_ids,
		use_rendered_html: 'true',
	} );

	return useQuery< Pattern[] >(
		[ siteId, 'block-patterns', pattern_ids ],
		() =>
			wpcomRequest( {
				apiNamespace: 'wpcom/v2',
				path: `/sites/${ encodeURIComponent( siteId ) }/block-patterns`,
				query: params.toString(),
			} ),
		{
			refetchOnMount: 'always',
			staleTime: Infinity,
		}
	);
};

export default useQueryPatterns;
