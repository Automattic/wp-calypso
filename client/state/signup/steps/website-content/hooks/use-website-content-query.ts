import { mapRecordKeysRecursively, snakeToCamelCase } from '@automattic/js-utils';
import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';
import type { WebsiteContentResponseDTO, WebsiteContentServerState } from '../types';
import type { SiteSlug } from 'calypso/types';

export function useWebsiteContentQuery( siteSlug: SiteSlug | undefined ) {
	return useQuery< WebsiteContentResponseDTO, unknown, WebsiteContentServerState >(
		[ 'bbe-website-content', siteSlug ],
		(): Promise< WebsiteContentResponseDTO > =>
			wpcom.req.get( {
				path: `/sites/${ siteSlug }/do-it-for-me/website-content`,
				apiNamespace: 'wpcom/v2',
			} ),
		{
			enabled: !! siteSlug,
			meta: { persist: false },
			select: ( data: WebsiteContentResponseDTO ) => ( {
				selectedPageTitles: data.selected_page_titles,
				isWebsiteContentSubmitted: data.is_website_content_submitted,
				isStoreFlow: data.is_store_flow,
				pages: data.pages?.length
					? data.pages.map( ( page: Record< string, unknown > ) =>
							mapRecordKeysRecursively( page, snakeToCamelCase )
					  )
					: [],
				siteLogoUrl: data.site_logo_url,
				genericFeedback: data.generic_feedback,
			} ),
			staleTime: Infinity,
		}
	);
}
