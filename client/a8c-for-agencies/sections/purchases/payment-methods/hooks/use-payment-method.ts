import { useEffect } from 'react';
import useStoredCards from './use-stored-cards';

export default function usePaymentMethod( refetchInterval?: number ) {
	// Fetch the stored cards from the cache if they are available.
	const {
		data: { allStoredCards },
		refetch,
	} = useStoredCards( undefined, true );

	const hasValidPaymentMethod = allStoredCards?.length > 0;

	// Refetch the stored cards every `refetchInterval` milliseconds until a valid payment method is found.
	useEffect( () => {
		if ( ! hasValidPaymentMethod && refetchInterval ) {
			const intervalId = setInterval( refetch, refetchInterval );
			return () => clearInterval( intervalId );
		}
	}, [ hasValidPaymentMethod, refetch, refetchInterval ] );

	return {
		paymentMethodRequired: ! hasValidPaymentMethod,
	};
}
