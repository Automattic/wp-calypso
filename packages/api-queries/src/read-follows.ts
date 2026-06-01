import {
	commonFeedExtensions,
	fetchFollowsPage,
	followSite,
	prepareComparableUrl,
	sortFollowsByLastUpdated,
	unfollowSite,
	updateSiteCommentEmailSubscription,
	updateSitePostEmailDeliveryFrequency,
	updateSitePostEmailSubscription,
	updateSitePostNotificationSubscription,
	type FollowDeliveryParams,
	type FollowItem,
	type FollowSiteParams,
	type FollowsPage,
	type UnfollowSiteParams,
} from '@automattic/api-core';
import {
	infiniteQueryOptions,
	mutationOptions,
	type InfiniteData,
	type QueryClient,
} from '@tanstack/react-query';

const ITEMS_PER_PAGE = 200;
const MAX_ITEMS = 2000;
const STALE_TIME = 60 * 60 * 1000;
const MAX_PAGES_TO_FETCH = MAX_ITEMS / ITEMS_PER_PAGE;
const SITE_SUBSCRIPTIONS_QUERY_KEY = [ 'read', 'site-subscriptions' ] as const;

export type FollowsInfiniteData = InfiniteData< FollowsPage, number >;

export const getFollowsQueryKey = () => [ 'read', 'follows' ] as const;

export const followsQuery = () =>
	infiniteQueryOptions<
		FollowsPage,
		Error,
		FollowsInfiniteData,
		ReturnType< typeof getFollowsQueryKey >,
		number
	>( {
		queryKey: getFollowsQueryKey(),
		queryFn: ( { pageParam } ) =>
			fetchFollowsPage( { page: pageParam, number: ITEMS_PER_PAGE, meta: '' } ),
		initialPageParam: 1,
		getNextPageParam: ( lastPage, allPages ) => {
			const fetchedItems = allPages.reduce( ( count, page ) => count + page.follows.length, 0 );
			const totalCount = allPages.find( ( page ) => typeof page.totalCount === 'number' )
				?.totalCount;

			if ( allPages.length >= MAX_PAGES_TO_FETCH ) {
				return undefined;
			}
			if ( lastPage.follows.length < ITEMS_PER_PAGE ) {
				return undefined;
			}
			if ( typeof totalCount === 'number' && fetchedItems >= Math.min( totalCount, MAX_ITEMS ) ) {
				return undefined;
			}

			return allPages.length + 1;
		},
		staleTime: STALE_TIME,
		meta: { persist: true },
	} );

export const getFollowsFromData = ( data?: FollowsInfiniteData ): FollowItem[] =>
	data?.pages.flatMap( ( page ) => page.follows ).filter( ( item ) => ! item.error ) ?? [];

export const getFollowsCountFromData = ( data?: FollowsInfiniteData ): number => {
	const totalCount =
		data?.pages.find( ( page ) => typeof page.totalCount === 'number' )?.totalCount ?? 0;
	const followingCount = getFollowsFromData( data ).filter(
		( follow ) => follow.is_following
	).length;

	return Math.max( totalCount, followingCount );
};

export const getFollowByBlogIdFromData = (
	data: FollowsInfiniteData | undefined,
	blogId: number | string
): FollowItem | undefined =>
	getFollowsFromData( data ).find( ( follow ) => Number( follow.blog_ID ) === Number( blogId ) );

export const getFollowByFeedIdFromData = (
	data: FollowsInfiniteData | undefined,
	feedId: number | string
): FollowItem | undefined =>
	getFollowsFromData( data ).find( ( follow ) => Number( follow.feed_ID ) === Number( feedId ) );

const commonFeedExtensionsByLength = [ ...commonFeedExtensions ].sort(
	( a, b ) => b.length - a.length
);

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

const followMatchesFeedUrl = ( follow: FollowItem, feedUrl?: string | null ): boolean => {
	const comparableFeedUrl = prepareComparableUrl( feedUrl );
	if ( ! comparableFeedUrl ) {
		return false;
	}

	const followUrls = [ follow.feed_URL, ...( follow.alias_feed_URLs ?? [] ) ]
		.map( ( url ) => prepareComparableUrl( url ) )
		.filter( ( url ): url is string => !! url );

	return followUrls.some(
		( followUrl ) =>
			followUrl === comparableFeedUrl || areCommonFeedAliases( followUrl, comparableFeedUrl )
	);
};

export const getAliasedFollowFeedUrl = (
	data: FollowsInfiniteData | undefined,
	feedUrl: string
): string | undefined =>
	getFollowsFromData( data ).find( ( follow ) => followMatchesFeedUrl( follow, feedUrl ) )
		?.feed_URL;

export const getIsFollowingFromData = (
	data: FollowsInfiniteData | undefined,
	{
		feedUrl,
		feedId,
		blogId,
	}: {
		feedUrl?: string | null;
		feedId?: number | string | null;
		blogId?: number | string | null;
	}
): boolean =>
	getFollowsFromData( data ).some( ( follow ) => {
		if ( ! follow.is_following ) {
			return false;
		}
		if ( feedUrl && followMatchesFeedUrl( follow, feedUrl ) ) {
			return true;
		}
		if (
			typeof feedId !== 'undefined' &&
			feedId !== null &&
			Number( follow.feed_ID ) === Number( feedId )
		) {
			return true;
		}
		if (
			typeof blogId !== 'undefined' &&
			blogId !== null &&
			Number( follow.blog_ID ) === Number( blogId )
		) {
			return true;
		}

		return false;
	} );

export const getFollowedSitesFromData = (
	data: FollowsInfiniteData | undefined,
	noOrganizationId: number | null
): FollowItem[] =>
	getFollowsFromData( data )
		.filter( ( follow ) => {
			if ( ! follow.is_following ) {
				return false;
			}

			if ( noOrganizationId === 0 || noOrganizationId === null ) {
				return (
					follow.organization_id === 0 ||
					follow.organization_id === null ||
					typeof follow.organization_id === 'undefined'
				);
			}

			return follow.organization_id === noOrganizationId;
		} )
		.sort( sortFollowsByLastUpdated );

export const getOrganizationFollowsFromData = (
	data: FollowsInfiniteData | undefined,
	organizationId: number
): FollowItem[] =>
	getFollowsFromData( data )
		.filter( ( follow ) => follow.is_following && follow.organization_id === organizationId )
		.sort( sortFollowsByLastUpdated );

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

const addRequestedAlias = ( follow: FollowItem, requestedFeedUrl?: string ): FollowItem => {
	if (
		! requestedFeedUrl ||
		prepareComparableUrl( requestedFeedUrl ) === prepareComparableUrl( follow.feed_URL )
	) {
		return follow;
	}

	const aliasFeedUrls = mergeAliasFeedUrls( follow.alias_feed_URLs, [ requestedFeedUrl ] );
	return {
		...follow,
		alias_feed_URLs: aliasFeedUrls,
	};
};

const mergeFollow = ( existingFollow: FollowItem, follow: FollowItem ): FollowItem => {
	const aliasFeedUrls = mergeAliasFeedUrls(
		existingFollow.alias_feed_URLs,
		follow.alias_feed_URLs
	).filter(
		( alias ) => prepareComparableUrl( alias ) !== prepareComparableUrl( follow.feed_URL )
	);
	const deliveryMethods = {
		...existingFollow.delivery_methods,
		...follow.delivery_methods,
		...( existingFollow.delivery_methods?.notification
			? { notification: existingFollow.delivery_methods.notification }
			: {} ),
	};

	return {
		...existingFollow,
		...follow,
		...( aliasFeedUrls.length
			? { alias_feed_URLs: aliasFeedUrls }
			: { alias_feed_URLs: undefined } ),
		delivery_methods: Object.keys( deliveryMethods ).length ? deliveryMethods : undefined,
		error: undefined,
	};
};

const createEmptyFollowsData = (): FollowsInfiniteData => ( {
	pages: [ { follows: [], totalCount: 0, page: 1, number: ITEMS_PER_PAGE } ],
	pageParams: [ 1 ],
} );

export const patchFollow = (
	queryClient: QueryClient,
	{
		requestedFeedUrl,
		follow,
	}: {
		requestedFeedUrl?: string;
		follow: FollowItem;
	}
) => {
	const followWithAlias = addRequestedAlias( follow, requestedFeedUrl );

	queryClient.setQueryData< FollowsInfiniteData >( getFollowsQueryKey(), ( data ) => {
		const currentData = data ?? createEmptyFollowsData();
		const hasPages = currentData.pages.length > 0;
		const pages = ( hasPages ? currentData.pages : createEmptyFollowsData().pages ).map(
			( page ) => ( {
				...page,
				follows: [ ...page.follows ],
			} )
		);
		let found = false;

		for ( const page of pages ) {
			page.follows = page.follows.map( ( existingFollow ) => {
				if (
					followMatchesFeedUrl( existingFollow, followWithAlias.feed_URL ) ||
					followWithAlias.alias_feed_URLs?.some( ( alias ) =>
						followMatchesFeedUrl( existingFollow, alias )
					)
				) {
					found = true;
					return mergeFollow( existingFollow, followWithAlias );
				}

				return existingFollow;
			} );
		}

		if ( ! found ) {
			pages[ 0 ] = {
				...pages[ 0 ],
				follows: [ followWithAlias, ...pages[ 0 ].follows ],
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
	} );
};

export const markFollowUnfollowed = ( queryClient: QueryClient, feedUrl: string ) => {
	queryClient.setQueryData< FollowsInfiniteData >( getFollowsQueryKey(), ( data ) => {
		if ( ! data ) {
			return data;
		}

		return {
			...data,
			pages: data.pages.map( ( page ) => ( {
				...page,
				follows: page.follows.map( ( follow ) => {
					if ( ! followMatchesFeedUrl( follow, feedUrl ) ) {
						return follow;
					}

					return {
						...follow,
						is_following: false,
						delivery_methods: {
							...follow.delivery_methods,
							notification: {
								...follow.delivery_methods?.notification,
								send_posts: false,
							},
						},
					};
				} ),
			} ) ),
		};
	} );
};

export const followSiteMutation = ( queryClient: QueryClient ) =>
	mutationOptions< FollowItem, Error, FollowSiteParams >( {
		mutationFn: ( params ) => followSite( params ),
		onSuccess: ( follow, params ) => {
			patchFollow( queryClient, { requestedFeedUrl: params.feedUrl, follow } );
			return queryClient.invalidateQueries( { queryKey: SITE_SUBSCRIPTIONS_QUERY_KEY } );
		},
	} );

export const unfollowSiteMutation = ( queryClient: QueryClient ) =>
	mutationOptions< unknown, Error, UnfollowSiteParams >( {
		mutationFn: ( params ) => unfollowSite( params ),
		onSuccess: async ( _response, params ) => {
			if ( params.feedUrl ) {
				markFollowUnfollowed( queryClient, params.feedUrl );
			} else {
				await queryClient.invalidateQueries( { queryKey: getFollowsQueryKey() } );
			}

			await queryClient.invalidateQueries( { queryKey: SITE_SUBSCRIPTIONS_QUERY_KEY } );
		},
	} );

const invalidateFollows = ( queryClient: QueryClient ) =>
	queryClient.invalidateQueries( { queryKey: getFollowsQueryKey() } );

type FollowDeliveryMutationContext = {
	previousData?: FollowsInfiniteData;
};

type FollowDeliveryPatchKind = 'post-email' | 'comment-email' | 'email-frequency' | 'notification';

const patchFollowDeliveryMethods = (
	queryClient: QueryClient,
	params: FollowDeliveryParams,
	kind: FollowDeliveryPatchKind
) => {
	queryClient.setQueryData< FollowsInfiniteData >( getFollowsQueryKey(), ( data ) => {
		if ( ! data ) {
			return data;
		}

		return {
			...data,
			pages: data.pages.map( ( page ) => ( {
				...page,
				follows: page.follows.map( ( follow ) => {
					if ( Number( follow.blog_ID ) !== Number( params.blogId ) ) {
						return follow;
					}

					const email = {
						...follow.delivery_methods?.email,
						...( kind === 'post-email' && typeof params.sendPosts === 'boolean'
							? { send_posts: params.sendPosts }
							: {} ),
						...( kind === 'comment-email' && typeof params.sendComments === 'boolean'
							? { send_comments: params.sendComments }
							: {} ),
						...( ( kind === 'post-email' || kind === 'email-frequency' ) && params.deliveryFrequency
							? { post_delivery_frequency: params.deliveryFrequency }
							: {} ),
					};
					const notification = {
						...follow.delivery_methods?.notification,
						...( kind === 'notification' && typeof params.sendPosts === 'boolean'
							? { send_posts: params.sendPosts }
							: {} ),
					};

					return {
						...follow,
						delivery_methods: {
							...follow.delivery_methods,
							...( kind === 'post-email' || kind === 'comment-email' || kind === 'email-frequency'
								? { email }
								: {} ),
							...( kind === 'notification' ? { notification } : {} ),
						},
					};
				} ),
			} ) ),
		};
	} );
};

const withOptimisticDeliveryPatch = (
	queryClient: QueryClient,
	params: FollowDeliveryParams,
	kind: FollowDeliveryPatchKind
): FollowDeliveryMutationContext => {
	const previousData = queryClient.getQueryData< FollowsInfiniteData >( getFollowsQueryKey() );
	patchFollowDeliveryMethods( queryClient, params, kind );

	return { previousData };
};

const rollbackOptimisticDeliveryPatch = (
	queryClient: QueryClient,
	context?: FollowDeliveryMutationContext
) => {
	if ( context?.previousData ) {
		queryClient.setQueryData( getFollowsQueryKey(), context.previousData );
	}
};

export const updateSitePostEmailSubscriptionMutation = ( queryClient: QueryClient ) =>
	mutationOptions< unknown, Error, FollowDeliveryParams, FollowDeliveryMutationContext >( {
		mutationFn: ( params ) => updateSitePostEmailSubscription( params ),
		onMutate: ( params ) => withOptimisticDeliveryPatch( queryClient, params, 'post-email' ),
		onError: ( _error, _params, context ) =>
			rollbackOptimisticDeliveryPatch( queryClient, context ),
		onSettled: () => invalidateFollows( queryClient ),
	} );

export const updateSiteCommentEmailSubscriptionMutation = ( queryClient: QueryClient ) =>
	mutationOptions< unknown, Error, FollowDeliveryParams, FollowDeliveryMutationContext >( {
		mutationFn: ( params ) => updateSiteCommentEmailSubscription( params ),
		onMutate: ( params ) => withOptimisticDeliveryPatch( queryClient, params, 'comment-email' ),
		onError: ( _error, _params, context ) =>
			rollbackOptimisticDeliveryPatch( queryClient, context ),
		onSettled: () => invalidateFollows( queryClient ),
	} );

export const updateSitePostEmailDeliveryFrequencyMutation = ( queryClient: QueryClient ) =>
	mutationOptions< unknown, Error, FollowDeliveryParams, FollowDeliveryMutationContext >( {
		mutationFn: ( params ) => updateSitePostEmailDeliveryFrequency( params ),
		onMutate: ( params ) => withOptimisticDeliveryPatch( queryClient, params, 'email-frequency' ),
		onError: ( _error, _params, context ) =>
			rollbackOptimisticDeliveryPatch( queryClient, context ),
		onSettled: () => invalidateFollows( queryClient ),
	} );

export const updateSitePostNotificationSubscriptionMutation = ( queryClient: QueryClient ) =>
	mutationOptions< unknown, Error, FollowDeliveryParams, FollowDeliveryMutationContext >( {
		mutationFn: ( params ) => updateSitePostNotificationSubscription( params ),
		onMutate: ( params ) => withOptimisticDeliveryPatch( queryClient, params, 'notification' ),
		onError: ( _error, _params, context ) =>
			rollbackOptimisticDeliveryPatch( queryClient, context ),
		onSettled: () => invalidateFollows( queryClient ),
	} );
