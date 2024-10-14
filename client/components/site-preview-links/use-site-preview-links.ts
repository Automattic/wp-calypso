import { useQuery } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { SiteId } from 'calypso/types';

export interface PreviewLink {
	code: string;
	created_at: string;
	expires_at?: string;
	isCreating?: boolean;
	isRemoving?: boolean;
}

export type PreviewLinksResponse = PreviewLink[];

interface UseSitePreviewLinksOptions {
	siteId: SiteId;
	isEnabled: boolean;
}

export const SITE_PREVIEW_LINKS_QUERY_KEY = 'site-preview-links';

export function useSitePreviewLinks( options: UseSitePreviewLinksOptions ) {
	const { siteId, isEnabled = false } = options;
	return useQuery< PreviewLinksResponse, unknown, PreviewLink[] >( {
		queryKey: [ SITE_PREVIEW_LINKS_QUERY_KEY, siteId ],
		queryFn: async () => {
			const response = await wpcom.req.get( {
				path: `/sites/${ siteId }/preview-links`,
				apiNamespace: 'wpcom/v2',
			} );
			return response;
		},
		enabled: isEnabled && !! siteId,
		meta: { persist: false },
	} );
}
