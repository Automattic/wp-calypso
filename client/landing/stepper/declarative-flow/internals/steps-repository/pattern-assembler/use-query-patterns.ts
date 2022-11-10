import { useLocale } from '@automattic/i18n-utils';
import { useQuery, UseQueryResult } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { Pattern } from './types';

type Options = {
	categories?: string;
	pattern_meta?: string;
	per_page?: number;
};

const useQueryPatterns = ( {
	categories,
	pattern_meta,
	per_page = -1,
}: Options = {} ): UseQueryResult< Pattern[] > => {
	const locale = useLocale();
	const params = new URLSearchParams( {
		per_page: `${ per_page }`,
		patterns_source: 'block_patterns',
		http_envelope: '1',
	} );

	if ( categories ) {
		params.set( 'categories', categories );
	}

	if ( pattern_meta ) {
		params.set( 'pattern_meta', pattern_meta );
	}

	return useQuery< Pattern[] >(
		[ 'ptk/patterns', categories, pattern_meta, locale ],
		() =>
			wpcomRequest( {
				apiNamespace: 'rest/v1',
				path: `/ptk/patterns/${ locale }`,
				query: params.toString(),
			} ),
		{
			refetchOnMount: 'always',
			staleTime: Infinity,
		}
	);
};

export default useQueryPatterns;
