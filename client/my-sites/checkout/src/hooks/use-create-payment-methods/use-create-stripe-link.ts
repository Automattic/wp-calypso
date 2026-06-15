import { isEnabled } from '@automattic/calypso-config';
import { createStripeLinkMethod } from '@automattic/wpcom-checkout';
import { useMemo } from 'react';
import useCartKey from 'calypso/my-sites/checkout/use-cart-key';
import type { StripeLoadingError } from '@automattic/calypso-stripe';
import type { PaymentMethod } from '@automattic/composite-checkout';
import type { Stripe } from '@stripe/stripe-js';

export default function useCreateStripeLink( {
	isStripeLoading,
	stripeLoadingError,
	stripe,
}: {
	isStripeLoading: boolean;
	stripeLoadingError: StripeLoadingError;
	stripe: Stripe | null;
} ): PaymentMethod | null {
	const cartKey = useCartKey();
	const shouldLoad =
		! isStripeLoading && ! stripeLoadingError && !! stripe && isEnabled( 'checkout/stripe-link' );

	return useMemo( () => {
		if ( ! shouldLoad || ! stripe || ! cartKey ) {
			return null;
		}
		return createStripeLinkMethod( stripe, cartKey );
	}, [ shouldLoad, stripe, cartKey ] );
}
