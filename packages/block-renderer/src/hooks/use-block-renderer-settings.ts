import { useQuery, UseQueryResult, UseQueryOptions } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { BlockRendererSettings } from '../types';

const useBlockRendererSettings = (
	siteId: number | string,
	stylesheet: string,
	useInlineStyles = false,
	queryOptions: UseQueryOptions< unknown, Error, BlockRendererSettings > = {}
): UseQueryResult< BlockRendererSettings > => {
	const params = new URLSearchParams( {
		stylesheet,
		use_inline_styles: useInlineStyles.toString(),
	} );

	return useQuery< any, Error, BlockRendererSettings >( {
		queryKey: [ siteId, 'block-renderer', stylesheet, useInlineStyles ],
		queryFn: () =>
			wpcomRequest( {
				path: `/sites/${ encodeURIComponent( siteId ) }/block-renderer/settings`,
				method: 'GET',
				apiNamespace: 'wpcom/v2',
				query: params.toString(),
			} ),
		...queryOptions,
		staleTime: Infinity,
		meta: {
			persist: false,
			...queryOptions.meta,
		},
	} );
};

export default useBlockRendererSettings;
