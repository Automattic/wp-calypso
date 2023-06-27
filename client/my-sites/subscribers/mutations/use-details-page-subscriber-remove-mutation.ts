import { useMutation, useQueryClient } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import { getSubscriberDetailsCacheKey, getSubscriberDetailsType } from '../helpers';
import type { Subscriber } from '../types';

const useDetailsPageSubscriberRemoveMutation = (
	siteId: number | null,
	subscriptionId: number | undefined,
	userId: number | undefined
) => {
	const queryClient = useQueryClient();
	const type = getSubscriberDetailsType( userId );

	return useMutation( {
		mutationFn: async ( subscriber: Subscriber ) => {
			if ( ! siteId || ! subscriber ) {
				throw new Error(
					// reminder: translate this string when we add it to the UI
					'Something went wrong while unsubscribing.'
				);
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
		onMutate: async () => {
			const cacheKey = getSubscriberDetailsCacheKey( siteId, subscriptionId, userId, type );
			await queryClient.cancelQueries( cacheKey );

			return {
				previousData: queryClient.getQueryData< Subscriber >( cacheKey ),
			};
		},
		onError: ( error, variables, context ) => {
			if ( context?.previousData ) {
				queryClient.setQueryData(
					getSubscriberDetailsCacheKey( siteId, subscriptionId, userId, type ),
					context.previousData
				);
			}
		},
		onSettled: () => {
			queryClient.invalidateQueries(
				getSubscriberDetailsCacheKey( siteId, subscriptionId, userId, type )
			);
		},
	} );
};

export default useDetailsPageSubscriberRemoveMutation;
