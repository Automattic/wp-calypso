import useStoredCards from './use-stored-cards';

export default function usePaymentMethod() {
	// Fetch the stored cards from the cache if they are available.
	const {
		data: { allStoredCards },
	} = useStoredCards( undefined, true );

	const hasValidPaymentMethod = allStoredCards?.length > 0;

	return {
		paymentMethodRequired: ! hasValidPaymentMethod,
	};
}
