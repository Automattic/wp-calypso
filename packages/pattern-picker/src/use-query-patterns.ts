import { useLocale } from '@automattic/i18n-utils';
import { useQuery, UseQueryResult } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { Pattern } from './types';

const useQueryPatterns = ( siteSlug: string ): UseQueryResult< Pattern[] > => {
	const locale = useLocale();
	const params = new URLSearchParams( {
		site: siteSlug,
		tags: 'pattern',
		http_envelope: '1',
	} );

	return useQuery< Pattern[] >(
		[ 'ptk/patterns', siteSlug, locale ],
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
