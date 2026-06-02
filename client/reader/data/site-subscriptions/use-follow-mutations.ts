import {
	followSiteMutation,
	getSiteSubscriptionsQueryKey,
	markSiteSubscriptionUnfollowed,
	patchSiteSubscription,
	unfollowSiteMutation,
	updateSiteCommentEmailSubscriptionMutation,
	updateSitePostEmailDeliveryFrequencyMutation,
	updateSitePostEmailSubscriptionMutation,
	updateSitePostNotificationSubscriptionMutation,
	type SiteSubscriptionsInfiniteData,
} from '@automattic/api-queries';
import config from '@automattic/calypso-config';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { translate } from 'i18n-calypso';
import { removeRecommendedSiteFromCache } from 'calypso/reader/data/recommended-sites';
import { useDispatch } from 'calypso/state';
import { errorNotice, successNotice } from 'calypso/state/notices/actions';
import {
	invalidateFollowSensitiveCaches,
	patchReadSiteFollowStatus,
	patchReadSiteFollowStatusByBlogId,
} from './cache';
import type {
	SiteSubscriptionItem,
	FollowSiteParams,
	UnfollowSiteParams,
} from '@automattic/api-core';
import type { QueryClient } from '@tanstack/react-query';

interface RecommendedSiteInfo {
	seed: number;
	siteId: number;
	siteTitle: string;
}

type FollowMutationContext = {
	previousSiteSubscriptionsData?: SiteSubscriptionsInfiniteData;
};

export {
	invalidateFollowSensitiveCaches,
	patchReadSiteFollowStatus,
	patchReadSiteFollowStatusByBlogId,
};

export const getFollowingSource = (): string | undefined => {
	const source = config( 'readerFollowingSource' );
	return typeof source === 'string' ? source : undefined;
};

const withFollowingSource = < TParams extends FollowSiteParams | UnfollowSiteParams >(
	params: TParams
): TParams => ( {
	...params,
	source: params.source ?? getFollowingSource(),
} );

const getNoticeTarget = ( feedUrl?: string ) => feedUrl ?? translate( 'this site' );

const getPositiveNumber = ( id?: number | string ): number | undefined => {
	const numericId = typeof id === 'string' ? Number( id ) : id;

	return typeof numericId === 'number' && Number.isFinite( numericId ) && numericId > 0
		? numericId
		: undefined;
};

const createOptimisticFollow = (
	params: FollowSiteParams & { feedUrl: string }
): SiteSubscriptionItem => ( {
	URL: params.feedUrl,
	feed_URL: params.feedUrl,
	blog_ID: getPositiveNumber( params.blogId ),
	is_following: true,
} );

const getFollowMutationContext = ( queryClient: QueryClient ): FollowMutationContext => ( {
	previousSiteSubscriptionsData: queryClient.getQueryData< SiteSubscriptionsInfiniteData >(
		getSiteSubscriptionsQueryKey()
	),
} );

const rollbackSiteSubscriptions = ( queryClient: QueryClient, context?: FollowMutationContext ) => {
	if ( context?.previousSiteSubscriptionsData ) {
		queryClient.setQueryData(
			getSiteSubscriptionsQueryKey(),
			context.previousSiteSubscriptionsData
		);
		return;
	}

	queryClient.removeQueries( { queryKey: getSiteSubscriptionsQueryKey(), exact: true } );
};

export const useFollowSite = ( recommendedSiteInfo?: RecommendedSiteInfo ) => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const baseMutation = followSiteMutation( queryClient );

	return useMutation( {
		...baseMutation,
		mutationFn: ( params: FollowSiteParams ) => {
			if ( ! baseMutation.mutationFn ) {
				throw new Error( 'Missing follow mutation function' );
			}
			return baseMutation.mutationFn( withFollowingSource( params ) );
		},
		onMutate: ( params ) => {
			const context = getFollowMutationContext( queryClient );

			if ( params.feedUrl ) {
				patchReadSiteFollowStatus( queryClient, params.feedUrl, true );
				patchSiteSubscription( queryClient, {
					requestedFeedUrl: params.feedUrl,
					subscription: createOptimisticFollow( { ...params, feedUrl: params.feedUrl } ),
				} );
			}

			return context;
		},
		onSuccess: async ( follow, params, context ) => {
			await baseMutation.onSuccess?.( follow, withFollowingSource( params ), context );
			patchReadSiteFollowStatus( queryClient, follow.feed_URL, true );
			if ( follow.blog_ID ) {
				patchReadSiteFollowStatusByBlogId( queryClient, follow.blog_ID, true );
			}
			await invalidateFollowSensitiveCaches( queryClient );

			if ( recommendedSiteInfo ) {
				removeRecommendedSiteFromCache( queryClient, {
					siteId: recommendedSiteInfo.siteId,
					seed: recommendedSiteInfo.seed,
				} );
				dispatch(
					successNotice(
						translate( "Success! You're now subscribed to %s.", {
							args: recommendedSiteInfo.siteTitle,
						} ),
						{ duration: 5000 }
					)
				);
			}
		},
		onError: ( error, params, context ) => {
			baseMutation.onError?.( error, withFollowingSource( params ), context );
			rollbackSiteSubscriptions( queryClient, context );
			if ( params.feedUrl ) {
				patchReadSiteFollowStatus( queryClient, params.feedUrl, false );
			}
			dispatch(
				errorNotice(
					translate( 'Sorry, there was a problem subscribing %(url)s. Please try again.', {
						args: { url: getNoticeTarget( params.feedUrl ) },
					} ),
					{ duration: 5000 }
				)
			);
		},
	} );
};

export const useUnfollowSite = () => {
	const queryClient = useQueryClient();
	const dispatch = useDispatch();
	const baseMutation = unfollowSiteMutation( queryClient );

	return useMutation( {
		...baseMutation,
		mutationFn: ( params: UnfollowSiteParams ) => {
			if ( ! baseMutation.mutationFn ) {
				throw new Error( 'Missing unfollow mutation function' );
			}
			return baseMutation.mutationFn( withFollowingSource( params ) );
		},
		onMutate: ( params ) => {
			const context = getFollowMutationContext( queryClient );

			if ( params.feedUrl ) {
				patchReadSiteFollowStatus( queryClient, params.feedUrl, false );
				markSiteSubscriptionUnfollowed( queryClient, params.feedUrl );
			}

			return context;
		},
		onSuccess: async ( response, params, context ) => {
			await baseMutation.onSuccess?.( response, withFollowingSource( params ), context );
			await invalidateFollowSensitiveCaches( queryClient );
		},
		onError: ( error, params, context ) => {
			baseMutation.onError?.( error, withFollowingSource( params ), context );
			rollbackSiteSubscriptions( queryClient, context );
			if ( params.feedUrl ) {
				patchReadSiteFollowStatus( queryClient, params.feedUrl, true );
			}
			dispatch(
				errorNotice(
					translate( 'Sorry, there was a problem unsubscribing %(url)s. Please try again.', {
						args: { url: getNoticeTarget( params.feedUrl ) },
					} ),
					{ duration: 5000 }
				)
			);
		},
	} );
};

export const useFollowDeliveryMutations = () => {
	const queryClient = useQueryClient();

	return {
		updatePostEmail: useMutation( updateSitePostEmailSubscriptionMutation( queryClient ) ),
		updateCommentEmail: useMutation( updateSiteCommentEmailSubscriptionMutation( queryClient ) ),
		updateDeliveryFrequency: useMutation(
			updateSitePostEmailDeliveryFrequencyMutation( queryClient )
		),
		updatePostNotifications: useMutation(
			updateSitePostNotificationSubscriptionMutation( queryClient )
		),
	};
};
