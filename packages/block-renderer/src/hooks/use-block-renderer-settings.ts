import { useQuery, UseQueryResult, UseQueryOptions } from 'react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { BlockRendererSettings } from '../types';

const useBlockRendererSettings = (
	siteId: number | string,
	stylesheet: string,
	useInlineStyles = false,
	queryOptions: UseQueryOptions< unknown, unknown, BlockRendererSettings > = {}
): UseQueryResult< BlockRendererSettings > => {
	const params = new URLSearchParams( {
		stylesheet,
		use_inline_styles: useInlineStyles.toString(),
	} );

	return useQuery< any, unknown, BlockRendererSettings >(
		[ siteId, 'block-renderer', stylesheet, useInlineStyles ],
		() =>
			wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteId ) }/block-renderer/settings`,
				method: 'GET',
				apiNamespace: 'wpcom/v2',
				query: params.toString(),
			} ),
		{
			...queryOptions,
			staleTime: Infinity,
			meta: {
				persist: false,
				...queryOptions.meta,
			},
		}
	);
};

export default useBlockRendererSettings;
