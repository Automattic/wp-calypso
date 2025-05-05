import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useStoredPaymentMethods } from 'calypso/my-sites/checkout/src/hooks/use-stored-payment-methods';
import { getPurchasesFieldDefinitions } from '../purchases-data-field';

export function usePurchasesFieldDefinitions() {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const paymentMethods = useStoredPaymentMethods().paymentMethods;

	return useMemo( () => {
		const fieldDefinitions = getPurchasesFieldDefinitions( {
			translate,
			moment,
			paymentMethods,
		} );
		return fieldDefinitions;
	}, [ translate, moment, paymentMethods ] );
}
