import { useMemo } from 'react';
import { createExistingPayPalPPCPMethod } from './existing-paypal-ppcp-payment-method';
import { useMemoCompare } from './use-memo-compare';
import type { StoredPaymentMethod, StoredPaymentMethodPayPal } from '@automattic/api-core';
import type { PaymentMethod } from '@automattic/composite-checkout';
import type { ReactNode } from 'react';

export const existingPayPalPPCPPrefix = 'existingPayPalPPCP-';

export function useCreateExistingPayPalPPCP( {
	storedPaymentMethods,
	submitButtonContent,
}: {
	storedPaymentMethods: StoredPaymentMethod[];
	submitButtonContent: ReactNode;
} ): PaymentMethod[] {
	const onlyStoredPayPalPPCP = storedPaymentMethods.filter( isPaymentMethodPayPalPPCP );

	// Memoize the PayPal payment methods by comparing their stored_details_id values, in case the
	// objects themselves are recreated on each render.
	const memoizedStoredPayPalPPCP = useMemoCompare( onlyStoredPayPalPPCP, ( prev, next ) => {
		const prevIds = prev.map( ( method ) => method.stored_details_id ) ?? [];
		const nextIds = next.map( ( method ) => method.stored_details_id ) ?? [];
		return (
			prevIds.length === nextIds.length && prevIds.every( ( id, index ) => id === nextIds[ index ] )
		);
	} );

	const existingPayPalPPCPMethods = useMemo( () => {
		return (
			memoizedStoredPayPalPPCP.map( ( storedDetails ) =>
				createExistingPayPalPPCPMethod( {
					id: `${ existingPayPalPPCPPrefix }${ storedDetails.stored_details_id }`,
					email: storedDetails.email,
					storedDetailsId: storedDetails.stored_details_id,
					paymentMethodToken: storedDetails.mp_ref,
					paymentPartnerProcessorId: storedDetails.payment_partner,
					submitButtonContent,
				} )
			) ?? []
		);
	}, [ memoizedStoredPayPalPPCP, submitButtonContent ] );

	return existingPayPalPPCPMethods;
}

function isPaymentMethodPayPalPPCP(
	method: StoredPaymentMethod
): method is StoredPaymentMethodPayPal {
	return method.payment_partner === 'paypal_ppcp';
}
