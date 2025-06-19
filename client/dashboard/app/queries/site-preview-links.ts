import {
	fetchSitePreviewLinks,
	createSitePreviewLink,
	deleteSitePreviewLink,
} from '../../data/site-preview-links';
import { queryClient } from '../query-client';
import type { SitePreviewLink } from '../../data/site-preview-links';

export const sitePreviewLinksQuery = ( siteId: number ) => ( {
	queryKey: [ 'site', siteId, 'preview-links' ],
	queryFn: () => {
		return fetchSitePreviewLinks( siteId );
	},
} );

export const sitePreviewLinkCreateMutation = ( siteId: number ) => ( {
	mutationFn: () => createSitePreviewLink( siteId ),
	onSuccess: ( data: SitePreviewLink ) => {
		queryClient.setQueryData( sitePreviewLinksQuery( siteId ).queryKey, [ data ] );
	},
} );

export const sitePreviewLinkDeleteMutation = ( siteId: number ) => ( {
	mutationFn: ( code: string ) => deleteSitePreviewLink( siteId, code ),
	onSuccess: () => {
		queryClient.removeQueries( sitePreviewLinksQuery( siteId ) );
	},
} );
