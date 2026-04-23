import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { GetManagePurchaseUrlFor } from 'calypso/lib/purchases/types';
import {
	getPurchasesFieldDefinitions,
	getMembershipsFieldDefinitions,
} from '../purchases-data-field';
import type { Purchase, Site, StoredPaymentMethod } from '@automattic/api-core';

export function usePurchasesFieldDefinitions( {
	sites,
	transferredOwnershipPurchases = [],
	getManagePurchaseUrlFor,
	paymentMethods,
}: {
	sites: Site[];
	transferredOwnershipPurchases?: Purchase[];
	getManagePurchaseUrlFor: GetManagePurchaseUrlFor;
	paymentMethods: StoredPaymentMethod[];
} ) {
	const translate = useTranslate();

	return useMemo( () => {
		const fieldDefinitions = getPurchasesFieldDefinitions( {
			translate,
			paymentMethods,
			getManagePurchaseUrlFor,
			sites,
			transferredOwnershipPurchases,
		} );
		return fieldDefinitions;
	}, [ translate, paymentMethods, sites, transferredOwnershipPurchases, getManagePurchaseUrlFor ] );
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
