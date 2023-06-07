import { useMutation, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';

type SubscriberEndpointResponse = {
	per_page: number;
	total: number;
	page: number;
	pages: number;
	subscribers: Subscriber[];
};

type Subscriber = {
	user_id: number;
	subscription_id: number;
	plans: {
		paid_subscription_id: number;
	}[];
};

const useSubscriberRemoveMutation = ( siteId: number, currentPage: number ) => {
	const queryClient = useQueryClient();

	return useMutation( {
		mutationFn: async ( subscriber: Subscriber ) => {
			if ( ! siteId || ! subscriber ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'Something went wrong while unsubscribing.'
				);
			}

			if ( subscriber.plans?.length ) {
				// unsubscribe this user from all plans
				const promises = subscriber.plans.map( ( plan ) =>
					wpcom.req.post(
						`/sites/${ siteId }/memberships/subscriptions/${ plan.paid_subscription_id }/cancel`,
						{
							user_id: subscriber.user_id,
						}
					)
				);

				await Promise.all( promises );
			}

			if ( subscriber.user_id ) {
				await wpcom.req.post( `/sites/${ siteId }/followers/${ subscriber.user_id }/delete` );
			} else {
				await wpcom.req.post(
					`/sites/${ siteId }/email-followers/${ subscriber.subscription_id }/delete`
				);
			}

			return true;
		},
		onMutate: async ( subscriber ) => {
			const cacheKey = [ 'subscribers', siteId, currentPage ];
			await queryClient.cancelQueries( cacheKey );

			const previousSubscribers =
				queryClient.getQueryData< SubscriberEndpointResponse >( cacheKey );

			// remove blog from site subscriptions
			if ( previousSubscribers ) {
				queryClient.setQueryData( cacheKey, {
					...previousSubscribers,
					subscribers: previousSubscribers.subscribers.filter( ( prevSubscriber ) => {
						return prevSubscriber.subscription_id !== subscriber.subscription_id;
					} ),
				} );
			}

			return {
				previousSubscribers,
			};
		},
		onError: ( error, variables, context ) => {
			if ( context?.previousSubscribers ) {
				queryClient.setQueryData( [ 'subscribers', siteId ], context.previousSubscribers );
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries( [ 'subscribers', siteId ] );
		},
	} );
};

export default useSubscriberRemoveMutation;
