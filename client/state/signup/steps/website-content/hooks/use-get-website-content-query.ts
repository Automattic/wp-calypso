import { mapRecordKeysRecursively, snakeToCamelCase } from '@automattic/js-utils';
import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { WebsiteContentResponseDTO, WebsiteContentServerState } from '../types';
import type { SiteId, SiteSlug } from 'calypso/types';

export function useGetWebsiteContentQuery( siteSlugOrId: SiteSlug | SiteId | undefined | null ) {
	return useQuery< WebsiteContentResponseDTO, unknown, WebsiteContentServerState >( {
		queryKey: [ 'bbe-website-content', siteSlugOrId ],
		queryFn: (): Promise< WebsiteContentResponseDTO > =>
			wpcom.req.get( {
				path: `/sites/${ siteSlugOrId }/do-it-for-me/website-content`,
				apiNamespace: 'wpcom/v2',
			} ),
		enabled: !! siteSlugOrId,
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
			searchTerms: data.search_terms,
		} ),
		staleTime: Infinity,
	} );
}
