import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { Subscription } from 'calypso/a8c-for-agencies/sections/client/types';
import wpcom from 'calypso/lib/wp';

interface Params {
	subscriptionId: number;
}

// FIXME: This is not the final endpoint but a temporary one. Will replace this once we figure out the correct endpoint.
function mutationCancelClientSubscription( { subscriptionId }: Params ): Promise< Subscription > {
	return wpcom.req.post( {
		method: 'DELETE',
		apiNamespace: 'wpcom/v2',
		path: '/agency-client/referrals',
		body: { license_key: subscriptionId },
	} );
}

export default function useCancelClientSubscription< TContext = unknown >(
	options?: UseMutationOptions< Subscription, Error, Params, TContext >
): UseMutationResult< Subscription, Error, Params, TContext > {
	return useMutation< Subscription, Error, Params, TContext >( {
		...options,
		mutationFn: mutationCancelClientSubscription,
	} );
}
