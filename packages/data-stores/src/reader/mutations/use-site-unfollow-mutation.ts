import { useMutation, useQueryClient } from 'react-query';
import { callApi } from '../helpers';
import { useIsLoggedIn } from '../hooks';
import { SiteSubscription, SubscriptionManagerSubscriptionsCount } from '../types';

type SiteSubscriptionUnfollowParams = {
	blog_id: number | string;
};

type SiteSubscriptionUnfollowResponse = {
	success: boolean;
	subscribed: boolean;
	subscription: null;
};

const useSiteUnfollowMutation = () => {
	const isLoggedIn = useIsLoggedIn();
	const queryClient = useQueryClient();
	return useMutation(
		async ( params: SiteSubscriptionUnfollowParams ) => {
			if ( ! params.blog_id ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'Something went wrong while unsubscribing.'
				);
			}

			const response = await callApi< SiteSubscriptionUnfollowResponse >( {
				path: `/read/site/${ params.blog_id }/post_email_subscriptions/delete`,
				method: 'POST',
				isLoggedIn,
				apiVersion: '1.2',
			} );
			if ( ! response.success ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'Something went wrong while unsubscribing.'
				);
			}

			return response;
		},
		{
			onMutate: async ( params ) => {
				await queryClient.cancelQueries( [ 'read', 'site-subscriptions', isLoggedIn ] );
				await queryClient.cancelQueries( [ 'read', 'subscriptions-count', isLoggedIn ] );

				const previousSiteSubscriptions = queryClient.getQueryData< SiteSubscription[] >( [
					'read',
					'site-subscriptions',
					isLoggedIn,
				] );

				// remove blog from site subscriptions
				if ( previousSiteSubscriptions ) {
					queryClient.setQueryData< SiteSubscription[] >(
						[ [ 'read', 'site-subscriptions', isLoggedIn ] ],
						previousSiteSubscriptions.filter(
							( siteSubscription ) => siteSubscription.blog_ID !== params.blog_id
						)
					);
				}

				const previousSubscriptionsCount =
					queryClient.getQueryData< SubscriptionManagerSubscriptionsCount >( [
						'read',
						'subscriptions-count',
						isLoggedIn,
					] );

				// decrement the blog count
				if ( previousSubscriptionsCount ) {
					queryClient.setQueryData< SubscriptionManagerSubscriptionsCount >(
						[ 'read', 'subscriptions-count', isLoggedIn ],
						{
							...previousSubscriptionsCount,
							blogs: previousSubscriptionsCount?.blogs
								? previousSubscriptionsCount?.blogs - 1
								: null,
						}
					);
				}

				return { previousSiteSubscriptions, previousSubscriptionsCount };
			},
			onError: ( error, variables, context ) => {
				if ( context?.previousSiteSubscriptions ) {
					queryClient.setQueryData< SiteSubscription[] >(
						[ 'read', 'site-subscriptions', isLoggedIn ],
						context.previousSiteSubscriptions
					);
				}
				if ( context?.previousSubscriptionsCount ) {
					queryClient.setQueryData< SubscriptionManagerSubscriptionsCount >(
						[ 'read', 'subscriptions-count', isLoggedIn ],
						context.previousSubscriptionsCount
					);
				}
			},
			onSettled: () => {
				queryClient.invalidateQueries( [ 'read', 'site-subscriptions', isLoggedIn ] );
				queryClient.invalidateQueries( [ 'read', 'subscriptions-count', isLoggedIn ] );
			},
		}
	);
};

export default useSiteUnfollowMutation;
