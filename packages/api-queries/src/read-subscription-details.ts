import { fetchReadSubscriptionDetails, unsubscribeFromReadSite } from '@automattic/api-core';
import { mutationOptions, queryOptions } from '@tanstack/react-query';
import type {
	SiteSubscriptionDetails,
	UnsubscribeFromReadSiteParams,
	UnsubscribeFromReadSiteResponse,
} from '@automattic/api-core';
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

const SITE_SUBSCRIPTIONS_PREFIX = [ 'read', 'site-subscriptions' ] as const;
const SUBSCRIPTIONS_COUNT_PREFIX = [ 'read', 'subscriptions-count' ] as const;
const FEED_SEARCH_PREFIX = [ 'read', 'feed', 'search' ] as const;

type SiteSubscriptionListEntry = {
	ID: string | number;
	blog_ID: number | string;
	isDeleted?: boolean;
	resubscribed?: boolean;
};

type SiteSubscriptionsPage = {
	total_subscriptions: number;
	subscriptions: SiteSubscriptionListEntry[];
};

type SiteSubscriptionsPagedData = {
	pages: SiteSubscriptionsPage[];
	pageParams: unknown[];
};

type SubscriptionsCountData = {
	blogs: number | null;
	comments: number | null;
	pending: number | null;
};

const matchesBlog = (
	subscription: SiteSubscriptionListEntry,
	blogId: number | string | undefined,
	subscriptionId: number | undefined
) =>
	( subscriptionId !== undefined && Number( subscription.ID ) === subscriptionId ) ||
	( blogId !== undefined && subscription.blog_ID === blogId );

export type UnsubscribeFromReadSiteMutationVariables = UnsubscribeFromReadSiteParams & {
	doNotInvalidateSiteSubscriptions?: boolean;
};

export const unsubscribeFromReadSiteMutation = ( queryClient: QueryClient ) =>
	mutationOptions( {
		mutationFn: ( params: UnsubscribeFromReadSiteMutationVariables ) =>
			unsubscribeFromReadSite( params ),
		onMutate: async ( params ) => {
			await queryClient.cancelQueries( { queryKey: SITE_SUBSCRIPTIONS_PREFIX } );
			await queryClient.cancelQueries( { queryKey: SUBSCRIPTIONS_COUNT_PREFIX } );

			const previousSiteSubscriptions = queryClient.getQueriesData< SiteSubscriptionsPagedData >( {
				queryKey: SITE_SUBSCRIPTIONS_PREFIX,
			} );
			queryClient.setQueriesData< SiteSubscriptionsPagedData >(
				{ queryKey: SITE_SUBSCRIPTIONS_PREFIX },
				( prev ) => {
					if ( ! prev ) {
						return prev;
					}
					return {
						...prev,
						pages: prev.pages.map( ( page ) => ( {
							...page,
							total_subscriptions: page.total_subscriptions - 1,
							subscriptions: page.subscriptions.map( ( subscription ) =>
								matchesBlog( subscription, params.blogId, params.subscriptionId )
									? { ...subscription, isDeleted: true, resubscribed: false }
									: subscription
							),
						} ) ),
					};
				}
			);

			const previousSubscriptionsCount = queryClient.getQueriesData< SubscriptionsCountData >( {
				queryKey: SUBSCRIPTIONS_COUNT_PREFIX,
			} );
			queryClient.setQueriesData< SubscriptionsCountData >(
				{ queryKey: SUBSCRIPTIONS_COUNT_PREFIX },
				( prev ) => {
					if ( ! prev ) {
						return prev;
					}
					return {
						...prev,
						blogs: prev.blogs ? prev.blogs - 1 : prev.blogs,
					};
				}
			);

			let detailsSnapshots: ReadSubscriptionDetailsCacheSnapshot[] = [];
			if ( params.blogId !== undefined ) {
				detailsSnapshots = await alterReadSubscriptionDetailsCache(
					queryClient,
					{ blogId: params.blogId },
					( prev ) => ( {
						...prev,
						subscriber_count: prev.subscriber_count - 1,
					} )
				);
			}

			return {
				previousSiteSubscriptions,
				previousSubscriptionsCount,
				detailsSnapshots,
			};
		},
		onError: ( _err, _variables, context ) => {
			if ( context?.previousSiteSubscriptions ) {
				for ( const [ key, data ] of context.previousSiteSubscriptions ) {
					queryClient.setQueryData( key, data );
				}
			}
			if ( context?.previousSubscriptionsCount ) {
				for ( const [ key, data ] of context.previousSubscriptionsCount ) {
					queryClient.setQueryData( key, data );
				}
			}
			if ( context?.detailsSnapshots ) {
				restoreReadSubscriptionDetailsCache( queryClient, context.detailsSnapshots );
			}
		},
		onSettled: ( _data, _err, params ) => {
			if ( ! params.doNotInvalidateSiteSubscriptions ) {
				queryClient.invalidateQueries( { queryKey: SITE_SUBSCRIPTIONS_PREFIX } );
			}
			queryClient.invalidateQueries( { queryKey: SUBSCRIPTIONS_COUNT_PREFIX } );
			queryClient.invalidateQueries( { queryKey: FEED_SEARCH_PREFIX } );
			invalidateReadSubscriptionDetails( queryClient );
			if ( params.blogId !== undefined ) {
				queryClient.invalidateQueries( {
					queryKey: [ 'read', 'sites', Number( params.blogId ) ],
				} );
			}
		},
	} );

export type UnsubscribeFromReadSiteMutationResult = UnsubscribeFromReadSiteResponse;
