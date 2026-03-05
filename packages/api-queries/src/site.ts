import {
	isInaccessibleJetpackError,
	fetchSite,
	deleteSite,
	launchSite,
	restoreSite,
	SITE_FIELDS,
	SITE_OPTIONS,
} from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { notFound } from '@tanstack/react-router';
import equal from 'fast-deep-equal/es6';
import { queryClient } from './query-client';
import type { Site } from '@automattic/api-core';
import type { Query } from '@tanstack/react-query';

function isSiteNotFoundError( error: unknown ) {
	return (
		error instanceof Error && [ 'UnknownBlogError', 'UnauthorizedError' ].includes( error.name )
	);
}

async function getSite( siteIdOrSlug: number | string ) {
	try {
		return await fetchSite( siteIdOrSlug );
	} catch ( e ) {
		// Force the site to be retrieved from wpcom if there is any issue with the Jetpack connection.
		if ( isInaccessibleJetpackError( e ) ) {
			const site = await fetchSite( siteIdOrSlug, { force: 'wpcom' } );

			// Throw an error if site.slug is not available because it means there is a site slug collision.
			if ( ! site.slug ) {
				throw e;
			}

			return {
				...site,
				__inaccessible_jetpack_error: e as Error,
			};
		}

		if ( isSiteNotFoundError( e ) ) {
			throw notFound();
		}

		throw e;
	}
}

export function siteBySlugQuery( siteSlug: string ) {
	// Used to find an existing Site object which is already in the `site-by-id` cache.
	const getFromCache = () =>
		queryClient
			.getQueriesData< Site >( {
				predicate: ( query ) =>
					query.queryKey.length >= 4 &&
					query.queryKey[ 0 ] === 'site-by-id' &&
					query.state.status === 'success' &&
					( query.state.data as Site )?.slug === siteSlug &&
					equal( new Set( query.queryKey[ 2 ] as string[] ), new Set( SITE_FIELDS ) ) &&
					equal( new Set( query.queryKey[ 3 ] as string[] ), new Set( SITE_OPTIONS ) ),
			} )
			.map( ( [ , data ] ) => data )[ 0 ];

	return queryOptions( {
		queryKey: [ 'site-by-slug', siteSlug, SITE_FIELDS, SITE_OPTIONS ],
		queryFn: () => getSite( siteSlug ),
		retry: ( failureCount, e: { isNotFound?: boolean } ) => {
			if ( e.isNotFound || isInaccessibleJetpackError( e ) ) {
				return false;
			}
			return failureCount < 3; // default retry count
		},
		initialData: () => getFromCache(),
		initialDataUpdatedAt: (): number | undefined => {
			const site = getFromCache();
			if ( site?.ID ) {
				return queryClient.getQueryState( siteByIdQuery( site.ID ).queryKey )?.dataUpdatedAt;
			}
		},
	} );
}

export function siteByIdQuery( siteId: number ) {
	// Used to find an existing Site object which is already in the `site-by-slug` cache.
	const getFromCache = () =>
		queryClient
			.getQueriesData< Site >( {
				predicate: ( query ) =>
					query.queryKey.length >= 4 &&
					query.queryKey[ 0 ] === 'site-by-slug' &&
					query.state.status === 'success' &&
					( query.state.data as Site )?.ID === siteId &&
					equal( new Set( query.queryKey[ 2 ] as string[] ), new Set( SITE_FIELDS ) ) &&
					equal( new Set( query.queryKey[ 3 ] as string[] ), new Set( SITE_OPTIONS ) ),
			} )
			.map( ( [ , data ] ) => data )[ 0 ];

	return queryOptions( {
		queryKey: [ 'site-by-id', siteId, SITE_FIELDS, SITE_OPTIONS ],
		queryFn: () => getSite( siteId ),
		retry: ( failureCount, e: { isNotFound?: boolean } ) => {
			if ( e.isNotFound || isInaccessibleJetpackError( e ) ) {
				return false;
			}
			return failureCount < 3; // default retry count
		},
		initialData: () => getFromCache(),
		initialDataUpdatedAt: (): number | undefined => {
			const site = getFromCache();
			if ( site?.slug ) {
				return queryClient.getQueryState( siteBySlugQuery( site.slug ).queryKey )?.dataUpdatedAt;
			}
		},
	} );
}

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
