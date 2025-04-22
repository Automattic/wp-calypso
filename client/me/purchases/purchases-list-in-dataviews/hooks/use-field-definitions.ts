import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { StoredPaymentMethod } from 'calypso/lib/checkout/payment-methods';
import { getPurchasesFieldDefinitions } from '../purchases-data-field';

export function usePurchasesFieldDefinitions( {
	paymentMethods,
}: {
	paymentMethods: StoredPaymentMethod[] | undefined;
} ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	const backupPaymentMethods = paymentMethods?.filter(
		( paymentMethod ) => paymentMethod.is_backup
	);

	return useMemo( () => {
		const fieldDefinitions = getPurchasesFieldDefinitions( {
			translate,
			moment,
			backupPaymentMethods,
		} );
		return fieldDefinitions;
	}, [ translate, moment, backupPaymentMethods ] );
}
