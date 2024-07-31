import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import type { PostObject } from '../types';

export function usePostByUrl( url: string ) {
	return useQuery< PostObject >( {
		queryKey: [ 'support-status', url ],
		queryFn: () =>
			canAccessWpcomApis()
				? wpcomRequest( {
						path: `help/article?post_url=${ encodeURIComponent( url ) }`,
						apiNamespace: 'wpcom/v2/',
						apiVersion: '2',
				  } )
				: apiFetch( {
						path: `/help-center/fetch-post?post_url=${ encodeURIComponent( url ) }`,
				  } ),
		enabled: !! url,
		refetchOnWindowFocus: false,
		staleTime: 12 * 3600, // 12 hours
	} );
}
