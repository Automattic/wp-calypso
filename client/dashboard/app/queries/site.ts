import { notFound } from '@tanstack/react-router';
import { fetchSite, deleteSite, launchSite, SITE_FIELDS, SITE_OPTIONS } from '../../data/site';
import { queryClient } from '../query-client';
import type { Site } from '../../data/site';
import type { Query } from '@tanstack/react-query';

export const siteBySlugQuery = ( siteSlug: string ) => ( {
	queryKey: [ 'site-by-slug', siteSlug, SITE_FIELDS, SITE_OPTIONS ],
	queryFn: async () => {
		try {
			return await fetchSite( siteSlug );
		} catch ( e: any ) /* eslint-disable-line @typescript-eslint/no-explicit-any */ {
			if ( e.error === 'unknown_blog' ) {
				throw notFound();
			}
			throw e;
		}
	},
} );

export const siteByIdQuery = ( siteId: number ) => ( {
	predicate: ( { queryKey, state }: Query ) => {
		return queryKey[ 0 ] === 'site-by-slug' && ( state.data as Site )?.ID === siteId;
	},
} );

export const siteDeleteMutation = ( siteId: number ) => ( {
	mutationFn: () => deleteSite( siteId ),
	onSuccess: () => {
		// Delay the invalidation for the redirection to complete first
		window.setTimeout( () => {
			queryClient.invalidateQueries( siteByIdQuery( siteId ) );
			queryClient.invalidateQueries( { queryKey: [ 'sites' ] } );
		}, 1000 );
	},
} );

export const siteLaunchMutation = ( siteId: number ) => ( {
	mutationFn: () => launchSite( siteId ),
	onSuccess: () => {
		queryClient.invalidateQueries( siteByIdQuery( siteId ) );
	},
} );
