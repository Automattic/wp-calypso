import { recordTracksEvent } from '@automattic/calypso-analytics';
import { localizeUrl } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import type { PostObject } from '../types';

export function usePostByUrl( url: string, sectionName: string ) {
	const postUrl = encodeURIComponent( localizeUrl( url ) );

	return useQuery< PostObject >( {
		queryKey: [ 'support-status', url ],
		queryFn: () =>
			canAccessWpcomApis()
				? wpcomRequest( {
						path: `/help/article?post_url=${ postUrl }`,
						apiNamespace: 'wpcom/v2',
				  } )
				: apiFetch( {
						path: `/help-center/fetch-post?post_url=${ postUrl }`,
				  } ),
		enabled: !! url,
		refetchOnWindowFocus: false,
		staleTime: 12 * 3600, // 12 hours
		throwOnError: ( error: any ) => {
			const tracksData = {
				force_site_id: true,
				location: 'help-center',
				section: sectionName,
				post_url: url,
				error_message: error?.message || ( typeof error === 'string' ? error : 'unknown' ),
				error_code: error?.code || error?.error || 'unknown',
				error_status: error?.status || error?.statusCode || 0,
			};

			recordTracksEvent( 'calypso_helpcenter_post_by_url_error', tracksData );
			return false;
		},
	} );
}
