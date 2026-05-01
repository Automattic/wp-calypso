import { fetchReadSubscriptionDetails } from '@automattic/api-core';
import { queryOptions } from '@tanstack/react-query';
import type { SiteSubscriptionDetails } from '@automattic/api-core';
import type { QueryClient } from '@tanstack/react-query';

interface ReadSubscriptionDetailsArgs {
	blogId?: string;
	subscriptionId?: string;
}

export const readSubscriptionDetailsQuery = ( {
	blogId,
	subscriptionId,
}: ReadSubscriptionDetailsArgs ) =>
	queryOptions( {
		queryKey: [ 'read', 'subscription-details', { blogId, subscriptionId } ],
		queryFn: () => fetchReadSubscriptionDetails( { blogId, subscriptionId } ),
		enabled: Boolean( blogId || subscriptionId ),
		staleTime: 60 * 1000,
		refetchOnWindowFocus: false,
	} );

const SUBSCRIPTION_DETAILS_PREFIX = [ 'read', 'subscription-details' ] as const;

export type ReadSubscriptionDetailsCacheSnapshot = {
	queryKey: readonly unknown[];
	data: SiteSubscriptionDetails< string >;
};

/**
 * Optimistically alter every cached subscription-details entry whose `blog_ID`
 * matches the target. Returns snapshots so the caller can roll back via
 * `restoreReadSubscriptionDetailsCache` on error.
 */
export const alterReadSubscriptionDetailsCache = async (
	queryClient: QueryClient,
	target: { blogId: string | number },
	updater: ( prev: SiteSubscriptionDetails< string > ) => SiteSubscriptionDetails< string >
): Promise< ReadSubscriptionDetailsCacheSnapshot[] > => {
	await queryClient.cancelQueries( { queryKey: SUBSCRIPTION_DETAILS_PREFIX } );
	const targetBlogId = Number( target.blogId );
	const snapshots: ReadSubscriptionDetailsCacheSnapshot[] = [];

	const matchingQueries = queryClient
		.getQueryCache()
		.findAll( { queryKey: SUBSCRIPTION_DETAILS_PREFIX } );

	for ( const query of matchingQueries ) {
		const prev = queryClient.getQueryData< SiteSubscriptionDetails< string > >( query.queryKey );
		if ( ! prev || prev.blog_ID !== targetBlogId ) {
			continue;
		}
		snapshots.push( { queryKey: query.queryKey, data: prev } );
		queryClient.setQueryData( query.queryKey, updater( prev ) );
	}

	return snapshots;
};

export const restoreReadSubscriptionDetailsCache = (
	queryClient: QueryClient,
	snapshots: ReadSubscriptionDetailsCacheSnapshot[]
) => {
	for ( const { queryKey, data } of snapshots ) {
		queryClient.setQueryData( queryKey, data );
	}
};

export const invalidateReadSubscriptionDetails = ( queryClient: QueryClient ) =>
	queryClient.invalidateQueries( { queryKey: SUBSCRIPTION_DETAILS_PREFIX } );
