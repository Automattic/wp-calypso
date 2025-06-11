import { fetchSite, deleteSite, launchSite, SITE_FIELDS, SITE_OPTIONS } from '../../data/site';
import { queryClient } from '../query-client';
import type { Site } from '../../data/site';
import type { Query } from '@tanstack/react-query';

export const siteBySlugQuery = ( siteSlug: string ) => ( {
	queryKey: [ 'site-by-slug', siteSlug, SITE_FIELDS, SITE_OPTIONS ],
	queryFn: () => fetchSite( siteSlug ),
} );

export const siteByIdQuery = ( siteId: string ) => ( {
	predicate: ( { queryKey, state }: Query ) => {
		return queryKey[ 0 ] === 'site-by-slug' && ( state.data as Site )?.ID === siteId;
	},
} );

export const siteDeleteMutation = ( siteId: string ) => ( {
	mutationFn: () => deleteSite( siteId ),
	onSuccess: () => {
		queryClient.invalidateQueries( siteByIdQuery( siteId ) );
	},
} );

export const siteLaunchMutation = ( siteId: string ) => ( {
	mutationFn: () => launchSite( siteId ),
	onSuccess: () => {
		queryClient.invalidateQueries( siteByIdQuery( siteId ) );
	},
} );
