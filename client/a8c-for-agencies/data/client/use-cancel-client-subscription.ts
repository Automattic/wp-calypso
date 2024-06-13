import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import wpcom from 'calypso/lib/wp';
import type { APILicense } from 'calypso/state/partner-portal/types';

interface Params {
	subscriptionId: number;
}

// FIXME: This is not the final endpoint but a temporary one. Will replace this once we figure out the correct endpoint.
function mutationCancelClientSubscription( { subscriptionId }: Params ): Promise< APILicense > {
	return wpcom.req.post( {
		method: 'DELETE',
		apiNamespace: 'wpcom/v2',
		path: '/agency-client/referrals',
		body: { license_key: subscriptionId },
	} );
}

export default function useCancelClientSubscription< TContext = unknown >(
	options?: UseMutationOptions< APILicense, Error, Params, TContext >
): UseMutationResult< APILicense, Error, Params, TContext > {
	return useMutation< APILicense, Error, Params, TContext >( {
		...options,
		mutationFn: mutationCancelClientSubscription,
	} );
}
