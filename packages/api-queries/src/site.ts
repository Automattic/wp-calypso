import {
	isWpError,
	fetchSite,
	deleteSite,
	launchSite,
	restoreSite,
	SITE_FIELDS,
	SITE_OPTIONS,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { notFound } from '@tanstack/react-router';
import { queryClient } from './query-client';
import type { Site } from '@automattic/api-core';
import type { Query } from '@tanstack/react-query';

const KNOWN_ERRORS = [ 'unknown_blog', 'unauthorized' ];

export const siteBySlugQuery = ( siteSlug: string ) =>
	queryOptions( {
		queryKey: [ 'site-by-slug', siteSlug, SITE_FIELDS, SITE_OPTIONS ],
		queryFn: async () => {
			try {
				return await fetchSite( siteSlug );
			} catch ( e ) {
				if ( isWpError( e ) && e.error && KNOWN_ERRORS.includes( e.error ) ) {
					throw notFound( { data: e.error } );
				}
				throw e;
			}
		},
		retry: ( failureCount, e: { data?: string } ) => {
			if ( e.data && KNOWN_ERRORS.includes( e.data ) ) {
				return false;
			}
			return failureCount < 3; // default retry count
		},
	} );

export const siteByIdQuery = ( siteId: number ) =>
	queryOptions( {
		queryKey: [ 'site-by-id', siteId, SITE_FIELDS, SITE_OPTIONS ],
		queryFn: async () => {
			try {
				return await fetchSite( siteId );
			} catch ( e ) {
				if ( isWpError( e ) && e.error && KNOWN_ERRORS.includes( e.error ) ) {
					throw notFound( { data: e.error } );
				}
				throw e;
			}
		},
		retry: ( failureCount, e: { data?: string } ) => {
			if ( e.data && KNOWN_ERRORS.includes( e.data ) ) {
				return false;
			}
			return failureCount < 3; // default retry count
		},
	} );

export const siteQueryFilter = ( siteId: number ) => ( {
	predicate: ( { queryKey, state }: Query ) => {
		return (
			( queryKey[ 0 ] === 'site-by-slug' || queryKey[ 0 ] === 'site-by-id' ) &&
			( state.data as Site )?.ID === siteId
		);
	},
} );

export const siteDeleteMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: () => deleteSite( siteId ),
		onSuccess: () => {
			// Delay the invalidation for the redirection to complete first
			window.setTimeout( () => {
				queryClient.invalidateQueries( siteQueryFilter( siteId ) );
				queryClient.invalidateQueries( { queryKey: [ 'site', siteId ] } );
				queryClient.invalidateQueries( { queryKey: [ 'sites' ] } );
			}, 1000 );
		},
	} );

export const siteLaunchMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: () => launchSite( siteId ),
		onSuccess: () => {
			queryClient.invalidateQueries( siteQueryFilter( siteId ) );
		},
	} );

export const siteRestoreMutation = ( siteId: number ) =>
	mutationOptions( {
		mutationFn: () => restoreSite( siteId ),
		onSuccess: () => {
			queryClient.invalidateQueries( siteQueryFilter( siteId ) );
			queryClient.invalidateQueries( { queryKey: [ 'site', siteId ] } );
			queryClient.invalidateQueries( { queryKey: [ 'sites' ] } );
		},
	} );
