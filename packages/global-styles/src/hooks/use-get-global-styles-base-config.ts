import { useQuery } from '@tanstack/react-query';
import wpcomRequest from 'wpcom-proxy-request';
import type { GlobalStylesObject } from '../types';

const useGetGlobalStylesBaseConfig = ( stylesheet: string ) => {
	return useQuery< any, unknown, GlobalStylesObject >( {
		queryKey: [ 'global-styles-base-config', stylesheet ],
		queryFn: async () =>
			wpcomRequest< GlobalStylesObject >( {
				// We have to fetch the base config from wpcom as the core endpoint only supports
				// active theme
				path: `/global-styles-variation/theme`,
				method: 'GET',
				apiNamespace: 'wpcom/v3',
				query: new URLSearchParams( { stylesheet } ).toString(),
			} ),
		refetchOnMount: 'always',
		staleTime: Infinity,
		enabled: !! stylesheet,
	} );
};

export default useGetGlobalStylesBaseConfig;
