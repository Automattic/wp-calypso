import { useQuery } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { GlobalStylesObject } from '../types';

const useGetGlobalStylesBaseConfig = ( siteId: number | string, stylesheet: string ) => {
	return useQuery< any, unknown, unknown >(
		[ 'globalStylesBaseConfig', siteId, stylesheet ],
		async () =>
			wpcomRequest< GlobalStylesObject >( {
				path: `/sites/${ encodeURIComponent( siteId ) }/global-styles/themes/${ stylesheet }`,
				method: 'GET',
				apiNamespace: 'wp/v2',
			} ),
		{
			refetchOnMount: 'always',
			staleTime: Infinity,
			enabled: !! ( siteId && stylesheet ),
		}
	);
};

export default useGetGlobalStylesBaseConfig;
