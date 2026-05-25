import { mapRecordKeysRecursively, snakeToCamelCase } from '@automattic/js-utils';
import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { WebsiteContentResponseDTO, WebsiteContentServerState } from '../types';
import type { SiteId, SiteSlug } from 'calypso/types';

export function selectWebsiteContent( data: WebsiteContentResponseDTO ): WebsiteContentServerState {
	const selectedPageTitles = data.selected_page_titles ?? [];
	const pages = data.pages?.length
		? data.pages.map( ( page: Record< string, unknown > ) =>
				mapRecordKeysRecursively( page, snakeToCamelCase )
		  )
		: [];
	// Server-provided instances win. Otherwise pair stored pages with
	// selected_page_titles positionally (server preserves order) so
	// instance.id === stored page.id and the saved-content lookup hits —
	// critical for distinguishing multiple CUSTOM_PAGE entries. When
	// lengths diverge, leave instances undefined and let the reducer
	// fall through to its type-based path.
	const selectedPageInstances =
		data.selected_page_instances?.map( ( i ) => ( {
			id: i.id,
			type: i.type,
			...( i.title ? { title: i.title } : {} ),
		} ) ) ??
		( pages.length === selectedPageTitles.length && pages.length > 0
			? pages.map( ( p: Record< string, unknown >, i: number ) => {
					const title = p.title;
					return {
						id: String( p.id ),
						type: selectedPageTitles[ i ],
						...( typeof title === 'string' && title ? { title } : {} ),
					};
			  } )
			: undefined );
	return {
		selectedPageTitles,
		selectedPageInstances,
		isWebsiteContentSubmitted: data.is_website_content_submitted,
		isStoreFlow: data.is_store_flow,
		pages,
		siteLogoUrl: data.site_logo_url,
		genericFeedback: data.generic_feedback,
		searchTerms: data.search_terms,
	};
}

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
		select: selectWebsiteContent,
		staleTime: Infinity,
	} );
}
