import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { Subscription } from 'calypso/a8c-for-agencies/sections/client/types';
import wpcom from 'calypso/lib/wp';

interface Params {
	licenseKey: string;
}

function mutationCancelClientSubscription( { licenseKey }: Params ): Promise< Subscription > {
	return wpcom.req.post( {
		method: 'DELETE',
		apiNamespace: 'wpcom/v2',
		path: '/agency-client/license',
		body: { license_key: licenseKey },
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
