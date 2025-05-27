import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { useStoredPaymentMethods } from 'calypso/my-sites/checkout/src/hooks/use-stored-payment-methods';
import {
	getPurchasesFieldDefinitions,
	getMembershipsFieldDefinitions,
} from '../purchases-data-field';

export function usePurchasesFieldDefinitions( fieldIds?: string[] ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const paymentMethods = useStoredPaymentMethods().paymentMethods;

	return useMemo( () => {
		const fieldDefinitions = getPurchasesFieldDefinitions( {
			translate,
			moment,
			paymentMethods,
			fieldIds,
		} );
		return fieldDefinitions;
	}, [ translate, moment, paymentMethods, fieldIds ] );
}

export function useMembershipsFieldDefinitions() {
	const translate = useTranslate();

	return useMemo( () => {
		const fieldDefinitions = getMembershipsFieldDefinitions( {
			translate,
		} );
		return fieldDefinitions;
	}, [ translate ] );
}
