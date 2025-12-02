import {
	fetchSitePreviewLinks,
	createSitePreviewLink,
	deleteSitePreviewLink,
} from '@automattic/api-core';
import { queryOptions, mutationOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';

export const sitePreviewLinksQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site', siteId, 'preview-links' ],
		queryFn: () => fetchSitePreviewLinks( siteId ),
	} );

export const sitePreviewLinkCreateMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: () => createSitePreviewLink( siteId ),
		onSuccess: ( data ) => {
			queryClient.setQueryData( sitePreviewLinksQuery( siteId ).queryKey, [ data ] );
		},
	} );

export const sitePreviewLinkDeleteMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: ( code: string ) => deleteSitePreviewLink( siteId, code ),
		onSuccess: () => {
			queryClient.removeQueries( sitePreviewLinksQuery( siteId ) );
		},
	} );
