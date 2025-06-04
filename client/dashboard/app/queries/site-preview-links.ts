import {
	fetchSitePreviewLinks,
	createSitePreviewLink,
	deleteSitePreviewLink,
} from '../../data/site-preview-links';
import { queryClient } from '../query-client';
import type { SitePreviewLink } from '../../data/site-preview-links';

export function sitePreviewLinksQuery( siteId: string ) {
	return {
		queryKey: [ 'site', siteId, 'preview-links' ],
		queryFn: () => {
			return fetchSitePreviewLinks( siteId );
		},
	};
}

export function sitePreviewLinkCreateMutation( siteId: string ) {
	return {
		mutationFn: () => createSitePreviewLink( siteId ),
		onSuccess: ( data: SitePreviewLink ) => {
			queryClient.setQueryData( sitePreviewLinksQuery( siteId ).queryKey, [ data ] );
		},
	};
}

export function sitePreviewLinkDeleteMutation( siteId: string ) {
	return {
		mutationFn: ( code: string ) => deleteSitePreviewLink( siteId, code ),
		onSuccess: () => {
			queryClient.removeQueries( sitePreviewLinksQuery( siteId ) );
		},
	};
}
