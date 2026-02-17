import { fetchJetpackSiteUrls } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';
import { queryClient } from './query-client';
import type { Site } from '@automattic/api-core';

function isSite( value: unknown ): value is Site {
	return (
		!! value &&
		typeof value === 'object' &&
		'jetpack' in value &&
		typeof value.jetpack === 'boolean' &&
		'URL' in value &&
		typeof value.URL === 'string'
	);
}

/**
 * Scans the query cache for any cached Site objects (from sites lists or individual site queries)
 * and returns URLs of Jetpack-connected sites. Used as placeholder data so collision detection
 * can start immediately while the authoritative fetch runs in the background.
 */
function getJetpackUrlsFromCache(): string[] | undefined {
	const urls = queryClient
		.getQueriesData< unknown >( {
			predicate: ( query ) =>
				query.state.status === 'success' &&
				( query.queryKey[ 0 ] === 'sites' ||
					query.queryKey[ 0 ] === 'site-by-id' ||
					query.queryKey[ 0 ] === 'site-by-slug' ),
		} )
		.flatMap( ( [ , data ] ) => {
			const items = Array.isArray( data ) ? data : [ data ];
			return items.flatMap( ( item ) => ( isSite( item ) && item.jetpack ? [ item.URL ] : [] ) );
		} );

	return urls.length > 0 ? [ ...new Set( urls ) ] : undefined;
}

export const jetpackSiteUrlsQuery = () =>
	queryOptions( {
		queryKey: [ 'jetpack-site-urls' ],
		queryFn: fetchJetpackSiteUrls,
		placeholderData: getJetpackUrlsFromCache,
	} );
