import useStoredCards from './use-stored-cards';

export default function usePaymentMethod() {
	const {
		data: { allStoredCards },
	} = useStoredCards( undefined, { staleTime: Infinity } );

	const hasValidPaymentMethod = allStoredCards?.length > 0;

	return {
		paymentMethodRequired: ! hasValidPaymentMethod,
	};
}
