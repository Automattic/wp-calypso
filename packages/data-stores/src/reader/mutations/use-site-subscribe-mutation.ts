import { useMutation, useQueryClient } from '@tanstack/react-query';
import { callApi } from '../helpers';
import { useCacheKey, useIsLoggedIn } from '../hooks';
import { SingleSiteSubscription } from '../types';

type SubscribeParams = {
	blog_id?: number | string;
};

type SubscribeResponse = {
	success?: boolean;
	subscribed?: boolean;
	subscription?: {
		blog_ID: string;
		delivery_frequency: string;
		status: string;
		ts: string;
	};
};

const useSiteSubscribeMutation = () => {
	const { isLoggedIn } = useIsLoggedIn();
	const queryClient = useQueryClient();
	const singleSubscriptionCacheKey = useCacheKey( [ 'read', 'single-site-subscriptions', 'dev' ] );

	return useMutation(
		async ( params: SubscribeParams ) => {
			if ( ! params.blog_id ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'Something went wrong while subscribing.'
				);
			}

			const response = await callApi< SubscribeResponse >( {
				path: `/read/site/${ params.blog_id }/post_email_subscriptions/new`,
				method: 'POST',
				isLoggedIn,
				apiVersion: '1.2',
				body: {},
			} );
			if ( ! response.success ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'Something went wrong while subscribing.'
				);
			}

			return response;
		},
		{
			onMutate: async () => {
				await queryClient.cancelQueries( singleSubscriptionCacheKey );

				const previousSingleSubscription = queryClient.getQueryData< SingleSiteSubscription >(
					singleSubscriptionCacheKey
				);
				// remove blog from site subscriptions
				if ( previousSingleSubscription ) {
					queryClient.setQueryData( singleSubscriptionCacheKey, {
						...previousSingleSubscription,
						subscriptions: previousSingleSubscription?.subscriptions + 1,
					} );
				}

				return { previousSingleSubscription };
			},
			onError: ( error, variables, context ) => {
				if ( context?.previousSingleSubscription ) {
					queryClient.setQueryData(
						singleSubscriptionCacheKey,
						context.previousSingleSubscription
					);
				}
			},
			onSettled: () => {
				queryClient.invalidateQueries( singleSubscriptionCacheKey );
			},
		}
	);
};

export default useSiteSubscribeMutation;
