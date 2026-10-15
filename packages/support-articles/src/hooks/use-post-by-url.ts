import { recordTracksEvent } from '@automattic/calypso-analytics';
import { localizeUrl } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import { useEffect } from '@wordpress/element';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import type { PostObject } from '../types';

export function usePostByUrl( url: string, sectionName: string ) {
	const postUrl = encodeURIComponent( localizeUrl( url ) );

	const query = useQuery< PostObject >( {
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
		staleTime: 12 * 60 * 60 * 1000, // 12 hours
	} );

	const { error } = query;

	// Tracked here rather than in `throwOnError`, which TanStack Query calls on every render while errored.
	useEffect( () => {
		if ( ! error ) {
			return;
		}

		const err = error as any;
		recordTracksEvent( 'calypso_helpcenter_post_by_url_error', {
			force_site_id: true,
			location: 'help-center',
			section: sectionName,
			post_url: url,
			error_message: err?.message || ( typeof err === 'string' ? err : 'unknown' ),
			error_code: err?.code || err?.error || 'unknown',
			error_status: err?.status || err?.statusCode || 0,
		} );
	}, [ error, url, sectionName ] );

	return query;
}
