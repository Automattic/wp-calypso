import { fetchSite, deleteSite, launchSite, SITE_FIELDS, SITE_OPTIONS } from '../../data/site';
import { queryClient } from '../query-client';
import type { Site } from '../../data/site';
import type { Query } from '@tanstack/react-query';

export const siteBySlugQuery = ( siteSlug: string ) => ( {
	queryKey: [ 'site-by-slug', siteSlug, SITE_FIELDS, SITE_OPTIONS ],
	queryFn: () => fetchSite( siteSlug ),
} );

export const siteByIdQuery = ( siteId: number ) => ( {
	predicate: ( { queryKey, state }: Query ) => {
		return queryKey[ 0 ] === 'site-by-slug' && ( state.data as Site )?.ID === siteId;
	},
} );

export const siteDeleteMutation = ( siteId: number ) => ( {
	mutationFn: () => deleteSite( siteId ),
	onSuccess: () => {
		queryClient.invalidateQueries( siteByIdQuery( siteId ) );
	},
} );

export const siteLaunchMutation = ( siteId: number ) => ( {
	mutationFn: () => launchSite( siteId ),
	onSuccess: () => {
		queryClient.invalidateQueries( siteByIdQuery( siteId ) );
	},
} );
