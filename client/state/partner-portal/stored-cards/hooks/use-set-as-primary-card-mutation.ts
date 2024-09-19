import { useMutation, UseMutationOptions, UseMutationResult } from '@tanstack/react-query';
import { wpcomJetpackLicensing as wpcomJpl } from 'calypso/lib/wp';
import type { SetAsPrimaryCardProps } from 'calypso/jetpack-cloud/sections/partner-portal/types';

interface APIResponse {
	success: boolean;
}

function mutationSetAsPrimaryCard( {
	paymentMethodId,
	useAsPrimaryPaymentMethod,
}: SetAsPrimaryCardProps ): Promise< APIResponse > {
	return wpcomJpl.req.post( {
		apiNamespace: 'wpcom/v2',
		path: `/jetpack-licensing/stripe/payment-method`,
		body: {
			payment_method_id: paymentMethodId,
			use_as_primary_payment_method: useAsPrimaryPaymentMethod,
		},
	} );
}

export default function useSetAsPrimaryCardMutation< TContext = unknown >(
	options?: UseMutationOptions< APIResponse, Error, SetAsPrimaryCardProps, TContext >
): UseMutationResult< APIResponse, Error, SetAsPrimaryCardProps, TContext > {
	return useMutation< APIResponse, Error, SetAsPrimaryCardProps, TContext >( {
		...options,
		mutationFn: mutationSetAsPrimaryCard,
	} );
}
