import { UseQueryResult, useQuery } from '@tanstack/react-query';
import { isCreditCard, type StoredPaymentMethod } from 'calypso/lib/checkout/payment-methods';
import { useStoredPaymentMethods } from '../../src/hooks/use-stored-payment-methods';
import {
	getTaxValidationResult,
	isContactValidationResponseValid,
} from '../../src/lib/contact-validation';
import { wrapValueInManagedValue } from '.';

export interface IsEligibleForOneClickCheckoutReturnValue {
	result: boolean | null;
	isLoading: boolean;
}

const useIsContactInfoValid = (
	paymentMethods: StoredPaymentMethod[]
): UseQueryResult< boolean | null > => {
	const storedCard = paymentMethods.length > 0 ? paymentMethods[ 0 ] : undefined;

	const validateContactDetails = async () => {
		const validationResult = await getTaxValidationResult( {
			state: wrapValueInManagedValue( storedCard?.tax_location?.subdivision_code ),
			city: wrapValueInManagedValue( storedCard?.tax_location?.city ),
			postalCode: wrapValueInManagedValue( storedCard?.tax_location?.postal_code ),
			countryCode: wrapValueInManagedValue( storedCard?.tax_location?.country_code ),
			organization: wrapValueInManagedValue( storedCard?.tax_location?.organization ),
			address1: wrapValueInManagedValue( storedCard?.tax_location?.address ),
			vatId: wrapValueInManagedValue( storedCard?.tax_location?.vat_id ),
		} );
		return isContactValidationResponseValid( validationResult );
	};

	return useQuery( {
		queryKey: [ 'contact-info-validation-result' ],
		queryFn: validateContactDetails,
		enabled: paymentMethods.length !== 0,
		refetchOnWindowFocus: true,
	} );
};

export const useIsEligibleForOneClickCheckout = (): IsEligibleForOneClickCheckoutReturnValue => {
	const { isLoading: isStoredPaymentsLoading, paymentMethods } = useStoredPaymentMethods( {
		type: 'card',
	} );
	const { isLoading: isContactInfoValidationLoading, data: contactValidationResult } =
		useIsContactInfoValid( paymentMethods );

	if ( isStoredPaymentsLoading || isContactInfoValidationLoading ) {
		return {
			isLoading: true,
			result: null,
		};
	}

	const storedCards = paymentMethods.filter( isCreditCard );

	if ( ! storedCards.length ) {
		return {
			isLoading: false,
			result: false,
		};
	}

	return {
		isLoading: false,
		result: contactValidationResult || null,
	};
};
