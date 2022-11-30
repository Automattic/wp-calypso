import { useQuery } from 'react-query';
import wpcom from 'calypso/lib/wp';
import type { SiteId } from 'calypso/types';

export interface PreviewLink {
	code: string;
	created_at: string;
	isCreating?: boolean;
	isRemoving?: boolean;
}

export type PreviewLinksResponse = PreviewLink[];

export const SITE_PREVIEW_LINKS_QUERY_KEY = 'site-preview-links';

export function useSitePreviewLinks( siteId: SiteId ) {
	return useQuery< PreviewLinksResponse, unknown, PreviewLink[] >(
		[ SITE_PREVIEW_LINKS_QUERY_KEY, siteId ],
		() =>
			wpcom.req.get( {
				path: `/sites/${ siteId }/preview-links`,
				apiNamespace: 'wpcom/v2',
			} ),
		{
			enabled: !! siteId,
			meta: { persist: false },
		}
	);
}
