import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { StoredPaymentMethod } from 'calypso/lib/checkout/payment-methods';
import { getPurchasesFieldDefinitions } from '../purchases-data-field';

export function usePurchasesFieldDefinitions( paymentMethods ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	let backupPaymentMethods;
	if ( paymentMethods ) {
		backupPaymentMethods = paymentMethods.filter(
			( paymentMethod ) => paymentMethod.is_backup === true
		);
	}

	return useMemo( () => {
		const fieldDefinitions = getPurchasesFieldDefinitions( {
			translate,
			moment,
			backupPaymentMethods,
		} );
		return fieldDefinitions;
	}, [ translate, moment, backupPaymentMethods ] );
}
