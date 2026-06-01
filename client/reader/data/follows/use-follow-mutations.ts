import {
	followSiteMutation,
	unfollowSiteMutation,
	updateSiteCommentEmailSubscriptionMutation,
	updateSitePostEmailDeliveryFrequencyMutation,
	updateSitePostEmailSubscriptionMutation,
	updateSitePostNotificationSubscriptionMutation,
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
import type { FollowSiteParams, UnfollowSiteParams } from '@automattic/api-core';

interface RecommendedSiteInfo {
	seed: number;
	siteId: number;
	siteTitle: string;
}

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
			if ( params.feedUrl ) {
				patchReadSiteFollowStatus( queryClient, params.feedUrl, true );
			}
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
			if ( params.feedUrl ) {
				patchReadSiteFollowStatus( queryClient, params.feedUrl, false );
			}
		},
		onSuccess: async ( response, params, context ) => {
			await baseMutation.onSuccess?.( response, withFollowingSource( params ), context );
			await invalidateFollowSensitiveCaches( queryClient );
		},
		onError: ( error, params, context ) => {
			baseMutation.onError?.( error, withFollowingSource( params ), context );
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
