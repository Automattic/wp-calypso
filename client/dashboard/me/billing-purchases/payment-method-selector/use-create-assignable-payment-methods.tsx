import { allowedPaymentMethodsQuery, userPaymentMethodsQuery } from '@automattic/api-queries';
import { useStripe } from '@automattic/calypso-stripe';
import { useQuery } from '@tanstack/react-query';
import { __ } from '@wordpress/i18n';
import { useMemo } from 'react';
import {
	useCreateExistingCards,
	isValueTruthy,
	translateCheckoutPaymentMethodToWpcomPaymentMethod,
} from '../payment-methods';
import { PaymentMethodSelectorSubmitButtonContent } from './payment-method-selector-submit-button-content';
import type { PaymentMethod } from '@automattic/composite-checkout';

/**
 * Hook to create the payment method objects required by the
 * PaymentMethodSelector for assigning payment methods to existing
 * subscriptions.
 *
 * Payment methods created for checkout use a quite different hook although a
 * similar system.
 */
export function useCreateAssignablePaymentMethods(): PaymentMethod[] {
	const { isStripeLoading, stripeLoadingError } = useStripe();

	const { data: allowedPaymentMethods, error: allowedPaymentMethodsError } = useQuery(
		allowedPaymentMethodsQuery()
	);

	const { data: storedCards = [] } = useQuery( userPaymentMethodsQuery( { type: 'card' } ) );

	const existingCardMethods = useCreateExistingCards( {
		isStripeLoading,
		stripeLoadingError,
		storedCards,
		submitButtonContent: (
			<PaymentMethodSelectorSubmitButtonContent text={ __( 'Use this card' ) } />
		),
		allowEditingTaxInfo: true,
		isTaxInfoRequired: true,
	} );

	const paymentMethods = useMemo(
		() =>
			[ ...existingCardMethods ].filter( isValueTruthy ).filter( ( method ) => {
				// If there's an error fetching allowed payment methods, just allow all of them.
				if ( allowedPaymentMethodsError ) {
					return true;
				}
				const paymentMethodName = translateCheckoutPaymentMethodToWpcomPaymentMethod( method.id );
				return paymentMethodName && allowedPaymentMethods?.includes( paymentMethodName );
			} ),
		[ existingCardMethods, allowedPaymentMethods, allowedPaymentMethodsError ]
	);

	if ( allowedPaymentMethods === undefined ) {
		return [];
	}

	return paymentMethods;
}
