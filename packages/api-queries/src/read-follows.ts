import {
	commonFeedExtensions,
	fetchReadFollows,
	followSite,
	prepareComparableUrl,
	sortSiteSubscriptionsByLastUpdated,
	unfollowSite,
	updateSiteCommentEmailSubscription,
	updateSitePostEmailDeliveryFrequency,
	updateSitePostEmailSubscription,
	updateSitePostNotificationSubscription,
	type FollowDeliveryParams,
	type SiteSubscriptionItem,
	type FollowSiteParams,
	type SiteSubscriptionsPage,
	type UnfollowSiteParams,
} from '@automattic/api-core';
import {
	infiniteQueryOptions,
	mutationOptions,
	type InfiniteData,
	type QueryClient,
} from '@tanstack/react-query';

// The /read/following/mine endpoint paginates by walking raw subscription rows
// with offset = (page - 1) * limit, and caps `limit` at 100 server-side
// (PER_PAGE_MAX). Keep the request size aligned with that cap so each page maps
// to exactly one server-side offset window. Consumers that supply their own
// queryFn (e.g. the data-stores subscription manager) must request this same
// page size, or the next-page detection below (which reasons about covered
// offset) will paginate incorrectly.
const ITEMS_PER_PAGE = 100;
const MAX_ITEMS = 2000;
const STALE_TIME = 60 * 60 * 1000;
const MAX_PAGES_TO_FETCH = MAX_ITEMS / ITEMS_PER_PAGE;

export type SiteSubscriptionsInfiniteData = InfiniteData< SiteSubscriptionsPage, number >;

export const getSiteSubscriptionsQueryKey = () => [ 'read', 'site-subscriptions' ] as const;

export const siteSubscriptionsQuery = () =>
	infiniteQueryOptions<
		SiteSubscriptionsPage,
		Error,
		SiteSubscriptionsInfiniteData,
		ReturnType< typeof getSiteSubscriptionsQueryKey >,
		number
	>( {
		queryKey: getSiteSubscriptionsQueryKey(),
		queryFn: ( { pageParam } ) =>
			fetchReadFollows( { page: pageParam, number: ITEMS_PER_PAGE, meta: '' } ),
		initialPageParam: 1,
		getNextPageParam: ( lastPage, allPages ) => {
			if ( allPages.length >= MAX_PAGES_TO_FETCH ) {
				return undefined;
			}

			// `total_subscriptions` is the server's raw row count (it does not
			// discount deleted/spammy sites). The server filters those out *after*
			// applying the page limit, so a page can come back short — or even
			// empty — while later offset windows still hold valid rows. We must
			// therefore decide whether another page exists from the offset we have
			// covered, not from how many items the last page happened to return.
			const totalCount = allPages.find( ( page ) => typeof page.totalCount === 'number' )
				?.totalCount;

			if ( typeof totalCount === 'number' ) {
				const requestedRows = allPages.length * ITEMS_PER_PAGE;
				return requestedRows >= Math.min( totalCount, MAX_ITEMS ) ? undefined : allPages.length + 1;
			}

			// Without a total to compare against, fall back to stopping on an
			// empty page.
			return lastPage.subscriptions.length === 0 ? undefined : allPages.length + 1;
		},
		staleTime: STALE_TIME,
		meta: { persist: true },
	} );

export const getSiteSubscriptionsFromData = (
	data?: SiteSubscriptionsInfiniteData
): SiteSubscriptionItem[] =>
	data?.pages.flatMap( ( page ) => page.subscriptions ).filter( ( item ) => ! item.error ) ?? [];

export const getSiteSubscriptionsCountFromData = (
	data?: SiteSubscriptionsInfiniteData
): number => {
	const totalCount =
		data?.pages.find( ( page ) => typeof page.totalCount === 'number' )?.totalCount ?? 0;
	const followingCount = getSiteSubscriptionsFromData( data ).filter(
		( subscription ) => subscription.is_following
	).length;

	return Math.max( totalCount, followingCount );
};

export const getSiteSubscriptionByBlogIdFromData = (
	data: SiteSubscriptionsInfiniteData | undefined,
	blogId: number | string
): SiteSubscriptionItem | undefined =>
	getSiteSubscriptionsFromData( data ).find(
		( subscription ) => Number( subscription.blog_ID ) === Number( blogId )
	);

export const getSiteSubscriptionByFeedIdFromData = (
	data: SiteSubscriptionsInfiniteData | undefined,
	feedId: number | string
): SiteSubscriptionItem | undefined =>
	getSiteSubscriptionsFromData( data ).find(
		( subscription ) => Number( subscription.feed_ID ) === Number( feedId )
	);

const commonFeedExtensionsByLength = Array.isArray( commonFeedExtensions )
	? [ ...commonFeedExtensions ].sort( ( a, b ) => b.length - a.length )
	: [];

const stripCommonFeedExtension = ( url: string ): string => {
	for ( const extension of commonFeedExtensionsByLength ) {
		const suffix = `/${ extension }`;
		if ( url.endsWith( suffix ) ) {
			return url.slice( 0, -suffix.length );
		}
	}
	return url;
};

const areCommonFeedAliases = ( left?: string, right?: string ): boolean => {
	if ( ! left || ! right ) {
		return false;
	}

	const strippedLeft = stripCommonFeedExtension( left );
	const strippedRight = stripCommonFeedExtension( right );

	return strippedLeft === strippedRight && ( strippedLeft !== left || strippedRight !== right );
};

const subscriptionMatchesFeedUrl = (
	subscription: SiteSubscriptionItem,
	feedUrl?: string | null
): boolean => {
	const comparableFeedUrl = prepareComparableUrl( feedUrl );
	if ( ! comparableFeedUrl ) {
		return false;
	}

	const subscriptionUrls = [ subscription.feed_URL, ...( subscription.alias_feed_URLs ?? [] ) ]
		.map( ( url ) => prepareComparableUrl( url ) )
		.filter( ( url ): url is string => !! url );

	return subscriptionUrls.some(
		( subscriptionUrl ) =>
			subscriptionUrl === comparableFeedUrl ||
			areCommonFeedAliases( subscriptionUrl, comparableFeedUrl )
	);
};

export const getAliasedSiteSubscriptionFeedUrl = (
	data: SiteSubscriptionsInfiniteData | undefined,
	feedUrl: string
): string | undefined =>
	getSiteSubscriptionsFromData( data ).find( ( subscription ) =>
		subscriptionMatchesFeedUrl( subscription, feedUrl )
	)?.feed_URL;

type SiteSubscriptionLookup = {
	feedUrl?: string | null;
	feedId?: number | string | null;
	blogId?: number | string | null;
};

/** Followed subscription matching feed URL, feed id, or blog id. */
export const getSiteSubscriptionFromData = (
	data: SiteSubscriptionsInfiniteData | undefined,
	{ feedUrl, feedId, blogId }: SiteSubscriptionLookup
): SiteSubscriptionItem | undefined =>
	getSiteSubscriptionsFromData( data ).find( ( subscription ) => {
		if ( ! subscription.is_following ) {
			return false;
		}
		if ( feedUrl && subscriptionMatchesFeedUrl( subscription, feedUrl ) ) {
			return true;
		}
		if (
			typeof feedId !== 'undefined' &&
			feedId !== null &&
			Number( subscription.feed_ID ) === Number( feedId )
		) {
			return true;
		}
		if (
			typeof blogId !== 'undefined' &&
			blogId !== null &&
			Number( subscription.blog_ID ) === Number( blogId )
		) {
			return true;
		}

		return false;
	} );

export const getIsSubscribedFromData = (
	data: SiteSubscriptionsInfiniteData | undefined,
	lookup: SiteSubscriptionLookup
): boolean => Boolean( getSiteSubscriptionFromData( data, lookup ) );

export const getSubscribedSitesFromData = (
	data: SiteSubscriptionsInfiniteData | undefined,
	noOrganizationId: number | null
): SiteSubscriptionItem[] =>
	getSiteSubscriptionsFromData( data )
		.filter( ( subscription ) => {
			if ( ! subscription.is_following ) {
				return false;
			}

			if ( noOrganizationId === 0 || noOrganizationId === null ) {
				return (
					subscription.organization_id === 0 ||
					subscription.organization_id === null ||
					typeof subscription.organization_id === 'undefined'
				);
			}

			return subscription.organization_id === noOrganizationId;
		} )
		.sort( sortSiteSubscriptionsByLastUpdated );

export const getOrganizationSiteSubscriptionsFromData = (
	data: SiteSubscriptionsInfiniteData | undefined,
	organizationId: number
): SiteSubscriptionItem[] =>
	getSiteSubscriptionsFromData( data )
		.filter(
			( subscription ) =>
				subscription.is_following && subscription.organization_id === organizationId
		)
		.sort( sortSiteSubscriptionsByLastUpdated );

const mergeAliasFeedUrls = ( ...aliasGroups: Array< Array< string | undefined > | undefined > ) => {
	const aliases = new Set< string >();

	for ( const aliasGroup of aliasGroups ) {
		for ( const alias of aliasGroup ?? [] ) {
			if ( alias ) {
				aliases.add( alias );
			}
		}
	}

	return [ ...aliases ];
};

const addRequestedAlias = (
	subscription: SiteSubscriptionItem,
	requestedFeedUrl?: string
): SiteSubscriptionItem => {
	if (
		! requestedFeedUrl ||
		prepareComparableUrl( requestedFeedUrl ) === prepareComparableUrl( subscription.feed_URL )
	) {
		return subscription;
	}

	const aliasFeedUrls = mergeAliasFeedUrls( subscription.alias_feed_URLs, [ requestedFeedUrl ] );
	return {
		...subscription,
		alias_feed_URLs: aliasFeedUrls,
	};
};

const mergeSiteSubscription = (
	existingSubscription: SiteSubscriptionItem,
	subscription: SiteSubscriptionItem
): SiteSubscriptionItem => {
	const aliasFeedUrls = mergeAliasFeedUrls(
		existingSubscription.alias_feed_URLs,
		subscription.alias_feed_URLs
	).filter(
		( alias ) => prepareComparableUrl( alias ) !== prepareComparableUrl( subscription.feed_URL )
	);
	const deliveryMethods = {
		...existingSubscription.delivery_methods,
		...subscription.delivery_methods,
		...( existingSubscription.delivery_methods?.notification
			? { notification: existingSubscription.delivery_methods.notification }
			: {} ),
	};

	return {
		...existingSubscription,
		...subscription,
		...( aliasFeedUrls.length
			? { alias_feed_URLs: aliasFeedUrls }
			: { alias_feed_URLs: undefined } ),
		delivery_methods: deliveryMethods,
		error: undefined,
	};
};

const createEmptySiteSubscriptionsData = (): SiteSubscriptionsInfiniteData => ( {
	pages: [ { subscriptions: [], totalCount: 0, page: 1, number: ITEMS_PER_PAGE } ],
	pageParams: [ 1 ],
} );

export const patchSiteSubscription = (
	queryClient: QueryClient,
	{
		requestedFeedUrl,
		subscription,
	}: {
		requestedFeedUrl?: string;
		subscription: SiteSubscriptionItem;
	}
) => {
	const subscriptionWithAlias = addRequestedAlias( subscription, requestedFeedUrl );

	queryClient.setQueryData< SiteSubscriptionsInfiniteData >(
		getSiteSubscriptionsQueryKey(),
		( data ) => {
			const currentData = data ?? createEmptySiteSubscriptionsData();
			const hasPages = currentData.pages.length > 0;
			const pages = ( hasPages ? currentData.pages : createEmptySiteSubscriptionsData().pages ).map(
				( page ) => ( {
					...page,
					subscriptions: [ ...page.subscriptions ],
				} )
			);
			let found = false;

			for ( const page of pages ) {
				page.subscriptions = page.subscriptions.map( ( existingSubscription ) => {
					if (
						subscriptionMatchesFeedUrl( existingSubscription, subscriptionWithAlias.feed_URL ) ||
						subscriptionWithAlias.alias_feed_URLs?.some( ( alias ) =>
							subscriptionMatchesFeedUrl( existingSubscription, alias )
						)
					) {
						found = true;
						return mergeSiteSubscription( existingSubscription, subscriptionWithAlias );
					}

					return existingSubscription;
				} );
			}

			if ( ! found ) {
				pages[ 0 ] = {
					...pages[ 0 ],
					subscriptions: [ subscriptionWithAlias, ...pages[ 0 ].subscriptions ],
					totalCount:
						typeof pages[ 0 ].totalCount === 'number'
							? pages[ 0 ].totalCount + 1
							: pages[ 0 ].totalCount,
				};
			}

			return {
				...currentData,
				pages,
				pageParams: hasPages ? currentData.pageParams : [ 1 ],
			};
		}
	);
};

export const markSiteSubscriptionUnfollowed = ( queryClient: QueryClient, feedUrl: string ) => {
	queryClient.setQueryData< SiteSubscriptionsInfiniteData >(
		getSiteSubscriptionsQueryKey(),
		( data ) => {
			if ( ! data ) {
				return data;
			}

			return {
				...data,
				pages: data.pages.map( ( page ) => ( {
					...page,
					subscriptions: page.subscriptions.map( ( subscription ) => {
						if ( ! subscriptionMatchesFeedUrl( subscription, feedUrl ) ) {
							return subscription;
						}

						return {
							...subscription,
							is_following: false,
							delivery_methods: {
								...subscription.delivery_methods,
								notification: {
									...subscription.delivery_methods?.notification,
									send_posts: false,
								},
							},
						};
					} ),
				} ) ),
			};
		}
	);
};

export const followSiteMutation = ( queryClient: QueryClient ) =>
	mutationOptions< SiteSubscriptionItem, Error, FollowSiteParams >( {
		mutationFn: ( params ) => followSite( params ),
		onSuccess: ( subscription, params ) => {
			patchSiteSubscription( queryClient, {
				requestedFeedUrl: params.feedUrl,
				subscription,
			} );
			return queryClient.invalidateQueries( { queryKey: getSiteSubscriptionsQueryKey() } );
		},
	} );

export const unfollowSiteMutation = ( queryClient: QueryClient ) =>
	mutationOptions< unknown, Error, UnfollowSiteParams >( {
		mutationFn: ( params ) => unfollowSite( params ),
		onSuccess: async ( _response, params ) => {
			if ( params.feedUrl ) {
				markSiteSubscriptionUnfollowed( queryClient, params.feedUrl );
			}

			await queryClient.invalidateQueries( { queryKey: getSiteSubscriptionsQueryKey() } );
		},
	} );

const invalidateSiteSubscriptions = ( queryClient: QueryClient ) =>
	queryClient.invalidateQueries( { queryKey: getSiteSubscriptionsQueryKey() } );

type SiteSubscriptionDeliveryMutationContext = {
	previousData?: SiteSubscriptionsInfiniteData;
};

type SiteSubscriptionDeliveryPatchKind =
	| 'post-email'
	| 'comment-email'
	| 'email-frequency'
	| 'notification';

/**
 * Patch the unseen_count of a subscription in the site subscriptions query data.
 * This is used to optimistically update the unseen_count when marking posts as
 * seen/unseen.
 */
export const patchSubscriptionSeenCount = (
	queryClient: QueryClient,
	match: { feedIds?: number[]; blogId?: number },
	update: ( currentCount: number ) => number
) => {
	if ( ! match.feedIds?.length && ! match.blogId ) {
		return;
	}

	const feedIdSet = new Set( match.feedIds?.map( Number ) );

	queryClient.setQueryData< SiteSubscriptionsInfiniteData >(
		getSiteSubscriptionsQueryKey(),
		( data ) => {
			if ( ! data ) {
				return data;
			}

			return {
				...data,
				pages: data.pages.map( ( page: SiteSubscriptionsPage ) => ( {
					...page,
					subscriptions: page.subscriptions.map(
						( subscription: SiteSubscriptionItem ): SiteSubscriptionItem => {
							// Match by feed ID or blog ID. Return subscription unchanged if no match.
							if (
								( match.feedIds?.length && ! feedIdSet.has( Number( subscription.feed_ID ) ) ) ||
								( match.blogId && Number( subscription.blog_ID ) !== Number( match.blogId ) )
							) {
								return subscription;
							}

							const current = subscription.unseen_count ?? 0;
							const newUnseenCount = Math.max( 0, update( current ) );

							return { ...subscription, unseen_count: newUnseenCount };
						}
					),
				} ) ),
			};
		}
	);
};

const patchSiteSubscriptionDeliveryMethods = (
	queryClient: QueryClient,
	params: FollowDeliveryParams,
	kind: SiteSubscriptionDeliveryPatchKind
) => {
	queryClient.setQueryData< SiteSubscriptionsInfiniteData >(
		getSiteSubscriptionsQueryKey(),
		( data ) => {
			if ( ! data ) {
				return data;
			}

			return {
				...data,
				pages: data.pages.map( ( page ) => ( {
					...page,
					subscriptions: page.subscriptions.map( ( subscription ) => {
						if ( Number( subscription.blog_ID ) !== Number( params.blogId ) ) {
							return subscription;
						}

						const email = {
							...subscription.delivery_methods?.email,
							...( kind === 'post-email' && typeof params.sendPosts === 'boolean'
								? { send_posts: params.sendPosts }
								: {} ),
							...( kind === 'comment-email' && typeof params.sendComments === 'boolean'
								? { send_comments: params.sendComments }
								: {} ),
							...( ( kind === 'post-email' || kind === 'email-frequency' ) &&
							params.deliveryFrequency
								? { post_delivery_frequency: params.deliveryFrequency }
								: {} ),
						};
						const notification = {
							...subscription.delivery_methods?.notification,
							...( kind === 'notification' && typeof params.sendPosts === 'boolean'
								? { send_posts: params.sendPosts }
								: {} ),
						};

						return {
							...subscription,
							delivery_methods: {
								...subscription.delivery_methods,
								...( kind === 'post-email' || kind === 'comment-email' || kind === 'email-frequency'
									? { email }
									: {} ),
								...( kind === 'notification' ? { notification } : {} ),
							},
						};
					} ),
				} ) ),
			};
		}
	);
};

const withOptimisticDeliveryPatch = (
	queryClient: QueryClient,
	params: FollowDeliveryParams,
	kind: SiteSubscriptionDeliveryPatchKind
): SiteSubscriptionDeliveryMutationContext => {
	const previousData = queryClient.getQueryData< SiteSubscriptionsInfiniteData >(
		getSiteSubscriptionsQueryKey()
	);
	patchSiteSubscriptionDeliveryMethods( queryClient, params, kind );

	return { previousData };
};

const rollbackOptimisticDeliveryPatch = (
	queryClient: QueryClient,
	context?: SiteSubscriptionDeliveryMutationContext
) => {
	if ( context?.previousData ) {
		queryClient.setQueryData( getSiteSubscriptionsQueryKey(), context.previousData );
	}
};

export const updateSitePostEmailSubscriptionMutation = ( queryClient: QueryClient ) =>
	mutationOptions< unknown, Error, FollowDeliveryParams, SiteSubscriptionDeliveryMutationContext >(
		{
			mutationFn: ( params ) => updateSitePostEmailSubscription( params ),
			onMutate: ( params ) => withOptimisticDeliveryPatch( queryClient, params, 'post-email' ),
			onError: ( _error, _params, context ) =>
				rollbackOptimisticDeliveryPatch( queryClient, context ),
			onSettled: () => invalidateSiteSubscriptions( queryClient ),
		}
	);

export const updateSiteCommentEmailSubscriptionMutation = ( queryClient: QueryClient ) =>
	mutationOptions< unknown, Error, FollowDeliveryParams, SiteSubscriptionDeliveryMutationContext >(
		{
			mutationFn: ( params ) => updateSiteCommentEmailSubscription( params ),
			onMutate: ( params ) => withOptimisticDeliveryPatch( queryClient, params, 'comment-email' ),
			onError: ( _error, _params, context ) =>
				rollbackOptimisticDeliveryPatch( queryClient, context ),
			onSettled: () => invalidateSiteSubscriptions( queryClient ),
		}
	);

export const updateSitePostEmailDeliveryFrequencyMutation = ( queryClient: QueryClient ) =>
	mutationOptions< unknown, Error, FollowDeliveryParams, SiteSubscriptionDeliveryMutationContext >(
		{
			mutationFn: ( params ) => updateSitePostEmailDeliveryFrequency( params ),
			onMutate: ( params ) => withOptimisticDeliveryPatch( queryClient, params, 'email-frequency' ),
			onError: ( _error, _params, context ) =>
				rollbackOptimisticDeliveryPatch( queryClient, context ),
			onSettled: () => invalidateSiteSubscriptions( queryClient ),
		}
	);

export const updateSitePostNotificationSubscriptionMutation = ( queryClient: QueryClient ) =>
	mutationOptions< unknown, Error, FollowDeliveryParams, SiteSubscriptionDeliveryMutationContext >(
		{
			mutationFn: ( params ) => updateSitePostNotificationSubscription( params ),
			onMutate: ( params ) => withOptimisticDeliveryPatch( queryClient, params, 'notification' ),
			onError: ( _error, _params, context ) =>
				rollbackOptimisticDeliveryPatch( queryClient, context ),
			onSettled: () => invalidateSiteSubscriptions( queryClient ),
		}
	);
