import { useMemo } from 'react';
import { createStoredCreditCardMethod } from '../lib/stored-credit-card-method';
import type { StripeConfiguration, StripeLoadingError } from '@automattic/calypso-stripe';
import type { PaymentMethod } from '@automattic/composite-checkout';
import type { Stripe } from '@stripe/stripe-js';

export function useCreateStoredCreditCardMethod( {
	isStripeLoading,
	stripeLoadingError,
	stripeConfiguration,
	stripe,
	activePayButtonText = undefined,
}: {
	isStripeLoading: boolean;
	stripeLoadingError: StripeLoadingError;
	stripeConfiguration: StripeConfiguration | null;
	stripe: Stripe | null;
	activePayButtonText?: string | undefined;
} ): PaymentMethod | null {
	const shouldLoadStripeMethod = ! isStripeLoading && ! stripeLoadingError;

	return useMemo(
		() =>
			shouldLoadStripeMethod
				? createStoredCreditCardMethod( {
						stripe,
						stripeConfiguration,
						activePayButtonText,
				  } )
				: null,
		[ shouldLoadStripeMethod, stripe, stripeConfiguration, activePayButtonText ]
	);
}
