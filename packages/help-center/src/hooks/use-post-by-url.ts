import { recordTracksEvent } from '@automattic/calypso-analytics';
import { localizeUrl } from '@automattic/i18n-utils';
import { useQuery } from '@tanstack/react-query';
import apiFetch from '@wordpress/api-fetch';
import wpcomRequest, { canAccessWpcomApis } from 'wpcom-proxy-request';
import { useHelpCenterContext } from '../contexts/HelpCenterContext';
import type { PostObject } from '../types';

export function usePostByUrl( url: string ) {
	const { sectionName } = useHelpCenterContext();
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
		throwOnError: () => {
			const tracksData = {
				force_site_id: true,
				location: 'help-center',
				section: sectionName,
				post_url: url,
			};

			recordTracksEvent( 'calypso_helpcenter_post_by_url_error', tracksData );
			return false;
		},
	} );
}
