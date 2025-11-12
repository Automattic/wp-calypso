import { isEnabled } from '@automattic/calypso-config';
import { useEffect } from 'react';
import useStoredCards from './use-stored-cards';

export default function usePaymentMethod( refetchInterval?: number ) {
	const isBillingDragonCheckoutEnabled = isEnabled( 'a4a-bd-checkout' );

	// Fetch the stored cards from the cache if they are available.
	const {
		data: { allStoredCards },
		refetch,
	} = useStoredCards( undefined, true );

	const hasValidPaymentMethod = allStoredCards?.length > 0;

	// Determine if a payment method is required based on the Billing Dragon feature flag and stored cards.
	const paymentMethodRequired = isBillingDragonCheckoutEnabled ? false : ! hasValidPaymentMethod;

	// Refetch the stored cards every `refetchInterval` milliseconds until a valid payment method is found.
	useEffect( () => {
		if ( ! isBillingDragonCheckoutEnabled && paymentMethodRequired && refetchInterval ) {
			const intervalId = setInterval( refetch, refetchInterval );
			return () => clearInterval( intervalId );
		}
	}, [ isBillingDragonCheckoutEnabled, paymentMethodRequired, refetch, refetchInterval ] );

	return {
		paymentMethodRequired,
	};
}
