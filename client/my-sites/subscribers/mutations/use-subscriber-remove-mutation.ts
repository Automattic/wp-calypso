import { useMutation, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { DEFAULT_PER_PAGE } from '../constants';
import {
	getSubscriberDetailsCacheKey,
	getSubscriberDetailsType,
	getSubscribersCacheKey,
} from '../helpers';
import useManySubsSite from '../hooks/use-many-subs-site';
import { useRecordSubscriberRemoved } from '../tracks';
import type { SubscriberEndpointResponse, Subscriber, SubscriberListArgs } from '../types';

type ApiResponseError = {
	error: string;
	message: string;
};

const useSubscriberRemoveMutation = (
	siteId: number | null,
	args: SubscriberListArgs,
	invalidateDetailsCache = false
) => {
	const {
		currentPage,
		perPage = DEFAULT_PER_PAGE,
		filterOption,
		filters = [],
		searchTerm,
		sortTerm,
	} = args;
	const queryClient = useQueryClient();
	const recordSubscriberRemoved = useRecordSubscriberRemoved();
	const { hasManySubscribers } = useManySubsSite( siteId );

	// Get the cache key for the current page
	const currentPageCacheKey = getSubscribersCacheKey(
		siteId,
		currentPage,
		perPage,
		searchTerm,
		sortTerm,
		filterOption,
		filters,
		hasManySubscribers
	);

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

			let wasRemoved = false;

			// Remove the subscriber from the followers and email followers because they may be both of them.
			if ( subscriber.user_id ) {
				try {
					await wpcom.req.post( `/sites/${ siteId }/followers/${ subscriber.user_id }/delete` );
					wasRemoved = true;
				} catch ( e ) {
					// Only throw if subscription_id is empty.
					if ( ( e as ApiResponseError )?.error === 'not_found' && ! subscriber.subscription_id ) {
						throw new Error( ( e as ApiResponseError )?.message );
					}
				}
			}

			// Always try to remove as email follower if they have a subscription_id.
			if ( subscriber.subscription_id ) {
				try {
					await wpcom.req.post(
						`/sites/${ siteId }/email-followers/${ subscriber.subscription_id }/delete`
					);
					wasRemoved = true;
				} catch ( e ) {
					// Only throw if we haven't successfully removed them through any other method.
					if ( ! wasRemoved ) {
						throw new Error( ( e as ApiResponseError )?.message );
					}
				}
			}

			return wasRemoved;
		},
		onMutate: async ( subscriber ) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries( { queryKey: [ 'subscribers', siteId ] } );

			// Get the current page data
			const previousData =
				queryClient.getQueryData< SubscriberEndpointResponse >( currentPageCacheKey );

			if ( previousData ) {
				// Update the current page data
				const updatedData = {
					...previousData,
					subscribers: previousData.subscribers.filter(
						( s ) => s.subscription_id !== subscriber.subscription_id
					),
					total: previousData.total - 1,
					pages: Math.ceil( ( previousData.total - 1 ) / previousData.per_page ),
				};

				// Update the current page cache
				queryClient.setQueryData( currentPageCacheKey, updatedData );

				// If this was the last item on the page and we're not on the first page,
				// we'll need to fetch the previous page's data
				if ( currentPage > 1 && updatedData.subscribers.length === 0 ) {
					const previousPageCacheKey = getSubscribersCacheKey(
						siteId,
						currentPage - 1,
						perPage,
						searchTerm,
						sortTerm,
						filterOption,
						filters,
						hasManySubscribers
					);
					await queryClient.invalidateQueries( { queryKey: previousPageCacheKey } );
				}
			}

			// Handle subscriber details cache if needed
			let previousDetailsData;
			if ( invalidateDetailsCache ) {
				const detailsCacheKey = getSubscriberDetailsCacheKey(
					siteId,
					subscriber.subscription_id,
					subscriber.user_id,
					getSubscriberDetailsType( subscriber.user_id )
				);
				await queryClient.cancelQueries( { queryKey: detailsCacheKey } );
				previousDetailsData = queryClient.getQueryData< Subscriber >( detailsCacheKey );
			}

			return {
				previousData,
				previousDetailsData,
			};
		},
		onError: ( error, variables, context ) => {
			// If the mutation fails, revert the optimistic update
			if ( context?.previousData ) {
				queryClient.setQueryData( currentPageCacheKey, context.previousData );
			}

			if ( context?.previousDetailsData ) {
				const detailsCacheKey = getSubscriberDetailsCacheKey(
					siteId,
					context.previousDetailsData.subscription_id,
					context.previousDetailsData.user_id,
					getSubscriberDetailsType( context.previousDetailsData.user_id )
				);
				queryClient.setQueryData( detailsCacheKey, context.previousDetailsData );
			}
		},
		onSuccess: ( data, subscriber ) => {
			recordSubscriberRemoved( {
				site_id: siteId,
				subscription_id: subscriber.subscription_id,
				user_id: subscriber.user_id,
			} );
		},
		onSettled: ( data, error, subscriber ) => {
			// Invalidate all subscriber queries to ensure consistency
			queryClient.invalidateQueries( { queryKey: [ 'subscribers', siteId ] } );

			if ( invalidateDetailsCache ) {
				const detailsCacheKey = getSubscriberDetailsCacheKey(
					siteId,
					subscriber.subscription_id,
					subscriber.user_id,
					getSubscriberDetailsType( subscriber.user_id )
				);
				queryClient.invalidateQueries( { queryKey: detailsCacheKey } );
			}
		},
	} );
};

export default useSubscriberRemoveMutation;
