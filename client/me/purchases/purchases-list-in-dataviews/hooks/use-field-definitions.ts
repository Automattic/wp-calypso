import { SiteDetails, Purchases } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { GetManagePurchaseUrlFor } from 'calypso/lib/purchases/types';
import { useStoredPaymentMethods } from 'calypso/my-sites/checkout/src/hooks/use-stored-payment-methods';
import {
	getPurchasesFieldDefinitions,
	getMembershipsFieldDefinitions,
} from '../purchases-data-field';

export function usePurchasesFieldDefinitions( {
	sites,
	transferredOwnershipPurchases = [],
	getManagePurchaseUrlFor,
}: {
	sites: SiteDetails[];
	transferredOwnershipPurchases?: Purchases.Purchase[];
	getManagePurchaseUrlFor: GetManagePurchaseUrlFor;
} ) {
	const translate = useTranslate();
	const moment = useLocalizedMoment();
	const paymentMethods = useStoredPaymentMethods().paymentMethods;

	return useMemo( () => {
		const fieldDefinitions = getPurchasesFieldDefinitions( {
			translate,
			moment,
			paymentMethods,
			getManagePurchaseUrlFor,
			sites,
			transferredOwnershipPurchases,
		} );
		return fieldDefinitions;
	}, [
		translate,
		moment,
		paymentMethods,
		sites,
		transferredOwnershipPurchases,
		getManagePurchaseUrlFor,
	] );
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
