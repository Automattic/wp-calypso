import { useMutation, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { DEFAULT_PER_PAGE } from '../constants';
import {
	getSubscriberDetailsCacheKey,
	getSubscriberDetailsType,
	getSubscribersCacheKey,
} from '../helpers';
import { useRecordSubscriberRemoved } from '../tracks';
import type { SubscriberEndpointResponse, Subscriber, SubscriberQueryParams } from '../types';

type ApiResponseError = {
	error: string;
	message: string;
};

/**
 * Gets the email subscription ID from a subscriber object.
 * @param {Subscriber} subscriber - The subscriber object
 * @returns {number} The email subscription ID, or 0 if not found
 * @deprecated The `subscription_id` property is deprecated and from the old API endpoint response. Use `email_subscription_id` instead.
 */
const getEmailSubscriptionId = ( subscriber: Subscriber ): number => {
	// `subscription_id` is from the old API endpoint response.
	return subscriber.email_subscription_id || subscriber.subscription_id || 0;
};

/**
 * Gets the WordPress.com subscription ID from a subscriber object.
 * @param {Subscriber} subscriber - The subscriber object
 * @returns {number} The WordPress.com subscription ID, or 0 if not found
 * @deprecated The `subscription_id` property is deprecated and from the old API endpoint response. Use `wpcom_subscription_id` instead.
 */
const getWpcomSubscriptionId = ( subscriber: Subscriber ): number => {
	// `subscription_id` is from the old API endpoint response.
	return subscriber.wpcom_subscription_id || subscriber.subscription_id || 0;
};

/**
 * Hook to remove subscribers from a site.
 * Handles removal of email subscribers, WordPress.com followers, and paid subscription members.
 * @param {number | null} siteId - The ID of the site
 * @param {SubscriberQueryParams} SubscriberQueryParams - Query parameters for subscriber list
 * @param {boolean} invalidateDetailsCache - Whether to invalidate the subscriber details cache (default: false)
 */
const useSubscriberRemoveMutation = (
	siteId: number | null,
	SubscriberQueryParams: SubscriberQueryParams,
	invalidateDetailsCache = false
) => {
	const {
		page,
		perPage = DEFAULT_PER_PAGE,
		filters = [],
		search,
		sortTerm,
	} = SubscriberQueryParams;
	const queryClient = useQueryClient();
	const recordSubscriberRemoved = useRecordSubscriberRemoved();

	// Get the cache key for the current page
	const currentPageCacheKey = getSubscribersCacheKey( {
		siteId,
		...SubscriberQueryParams,
	} );

	return useMutation( {
		mutationFn: async ( subscribers: Subscriber[] ) => {
			if ( ! siteId || ! subscribers || ! subscribers.length ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'Something went wrong while unsubscribing.'
				);
			}

			if ( subscribers.length > 100 ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'The maximum number of subscribers you can remove at once is 100.'
				);
			}

			const subscriberPromises = subscribers.map( async ( subscriber ) => {
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

				let emailRemoved = false;
				let wpcomRemoved = false;

				const numericUserId = Number( subscriber.user_id );
				const emailSubscriptionId = getEmailSubscriptionId( subscriber );

				// Remove the subscriber from the followers if they have a numeric user_id
				if ( ! isNaN( numericUserId ) ) {
					try {
						const response = await wpcom.req.post(
							`/sites/${ siteId }/followers/${ numericUserId }/delete`
						);
						wpcomRemoved = response?.deleted === true;
					} catch ( e ) {
						// Only throw if they don't have an email subscription ID to try next
						if ( ( e as ApiResponseError )?.error === 'not_found' && ! emailSubscriptionId ) {
							throw new Error( ( e as ApiResponseError )?.message );
						}
					}
				}

				// Try to remove as email follower if they have an email subscription ID
				if ( emailSubscriptionId ) {
					try {
						const response = await wpcom.req.post(
							`/sites/${ siteId }/email-followers/${ emailSubscriptionId }/delete`
						);
						// Verify the response indicates successful deletion
						emailRemoved = response?.deleted === true;
					} catch ( e ) {
						// Consider "not_following" as a successful removal since they're already not following
						if ( ( e as ApiResponseError )?.error === 'not_following' ) {
							emailRemoved = true;
						} else if ( ! wpcomRemoved ) {
							// Only throw if we haven't successfully removed them through any other method
							throw new Error( ( e as ApiResponseError )?.message );
						}
					}
				}

				// Consider removal successful if:
				// 1. Email subscription was either:
				//    - Successfully removed (if it existed)
				//    - Did not exist (no removal needed)
				// 2. WPCOM following was either:
				//    - Successfully removed (if it existed)
				//    - Did not exist (no removal needed)
				const isFullyRemoved =
					( emailSubscriptionId ? emailRemoved : true ) &&
					( ! isNaN( numericUserId ) ? wpcomRemoved : true );

				return isFullyRemoved;
			} );
			const promiseResults = await Promise.allSettled( subscriberPromises );
			if (
				promiseResults.every( ( promiseResults ) => {
					return promiseResults.status === 'fulfilled' && promiseResults.value === true;
				} )
			) {
				return true;
			}
			const errorPromise = promiseResults.find( ( promiseResult ) => {
				return promiseResult.status === 'rejected';
			} );
			if ( errorPromise ) {
				throw new Error( errorPromise.reason );
			}
			return false;
		},
		onMutate: async ( subscribers ) => {
			// Cancel any outgoing refetches
			await queryClient.cancelQueries( { queryKey: [ 'subscribers', siteId ] } );
			await queryClient.cancelQueries( { queryKey: [ 'subscribers', 'count', siteId ] } );

			// Get the current page data
			const previousData =
				queryClient.getQueryData< SubscriberEndpointResponse >( currentPageCacheKey );

			// Get the current count data
			const previousCountData = queryClient.getQueryData< { email_subscribers: number } >( [
				'subscribers',
				'count',
				siteId,
			] );

			if ( previousData ) {
				// Update the current page data
				const updatedData = {
					...previousData,
					subscribers: previousData.subscribers.filter( ( s ) => {
						return ! subscribers.some( ( subscriber ) => {
							// Match on either wpcom or email subscription ID
							const sEmailId = getEmailSubscriptionId( s );
							const subscriberEmailId = getEmailSubscriptionId( subscriber );
							const sWpcomId = getWpcomSubscriptionId( s );
							const subscriberWpcomId = getWpcomSubscriptionId( subscriber );
							return (
								( sEmailId && sEmailId === subscriberEmailId ) ||
								( sWpcomId && sWpcomId === subscriberWpcomId )
							);
						} );
					} ),
					total: previousData.total - subscribers.length,
					pages: Math.ceil( ( previousData.total - subscribers.length ) / previousData.per_page ),
				};

				// Update the current page cache
				queryClient.setQueryData( currentPageCacheKey, updatedData );

				// If this was the last item on the page and we're not on the first page,
				// we'll need to fetch the previous page's data
				if ( page > 1 && updatedData.subscribers.length === 0 ) {
					const previousPageCacheKey = getSubscribersCacheKey( {
						siteId,
						page: page - 1,
						perPage,
						search,
						sortTerm,
						filters,
					} );
					await queryClient.invalidateQueries( { queryKey: previousPageCacheKey } );
				}
			}

			// Update the count cache if it exists
			if ( previousCountData ) {
				const updatedCountData = {
					...previousCountData,
					email_subscribers: previousCountData.email_subscribers - subscribers.length,
				};
				queryClient.setQueryData( [ 'subscribers', 'count', siteId ], updatedCountData );
			}

			// Handle subscriber details cache if needed
			let previousDetailsData;
			if ( invalidateDetailsCache ) {
				for ( const subscriber of subscribers ) {
					const detailsCacheKey = getSubscriberDetailsCacheKey(
						siteId,
						getEmailSubscriptionId( subscriber ),
						subscriber.user_id,
						getSubscriberDetailsType( subscriber.user_id )
					);
					await queryClient.cancelQueries( { queryKey: detailsCacheKey } );
					previousDetailsData = queryClient.getQueryData< Subscriber >( detailsCacheKey );
				}
			}

			return {
				previousData,
				previousCountData,
				previousDetailsData,
			};
		},
		onError: ( error, variables, context ) => {
			// If the mutation fails, revert the optimistic update
			if ( context?.previousData ) {
				queryClient.setQueryData( currentPageCacheKey, context.previousData );
			}

			// Revert the count data if it exists
			if ( context?.previousCountData ) {
				queryClient.setQueryData( [ 'subscribers', 'count', siteId ], context.previousCountData );
			}

			if ( context?.previousDetailsData ) {
				const detailsCacheKey = getSubscriberDetailsCacheKey(
					siteId,
					getEmailSubscriptionId( context.previousDetailsData ),
					context.previousDetailsData.user_id,
					getSubscriberDetailsType( context.previousDetailsData.user_id )
				);
				queryClient.setQueryData( detailsCacheKey, context.previousDetailsData );
			}

			// Force invalidate all subscriber queries to ensure UI is in sync
			queryClient.invalidateQueries( { queryKey: [ 'subscribers', siteId ] } );
			queryClient.invalidateQueries( { queryKey: [ 'subscribers', 'count', siteId ] } );
		},
		onSuccess: ( data, subscribers ) => {
			// Force invalidate all subscriber queries to ensure UI is in sync
			queryClient.invalidateQueries( { queryKey: [ 'subscribers', siteId ] } );
			queryClient.invalidateQueries( { queryKey: [ 'subscribers', 'count', siteId ] } );

			for ( const subscriber of subscribers ) {
				recordSubscriberRemoved( {
					site_id: siteId,
					subscription_id: getEmailSubscriptionId( subscriber ),
					user_id: subscriber.user_id,
				} );
			}
		},
		onSettled: ( data, error, subscribers ) => {
			// Always invalidate and refetch everything to ensure consistency
			queryClient.invalidateQueries( { queryKey: [ 'subscribers', siteId ] } );
			queryClient.invalidateQueries( { queryKey: [ 'subscribers', 'count', siteId ] } );

			// Always handle subscriber details cache if requested
			if ( invalidateDetailsCache ) {
				for ( const subscriber of subscribers ) {
					const detailsCacheKey = getSubscriberDetailsCacheKey(
						siteId,
						getEmailSubscriptionId( subscriber ),
						subscriber.user_id,
						getSubscriberDetailsType( subscriber.user_id )
					);
					queryClient.invalidateQueries( { queryKey: detailsCacheKey } );
				}
			}
		},
	} );
};

export default useSubscriberRemoveMutation;
