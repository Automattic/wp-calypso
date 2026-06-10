import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { getFieldDefinitions } from '../field-definitions';
import type { BillingTransaction } from 'calypso/state/billing-transactions/types';

export function useFieldDefinitions(
	transactions: BillingTransaction[] | null,
	getReceiptUrlFor: ( receiptId: string ) => string,
	visibleFields: string[]
) {
	const translate = useTranslate();

	return useMemo( () => {
		return getFieldDefinitions( transactions, translate, getReceiptUrlFor, visibleFields );
	}, [ transactions, translate, getReceiptUrlFor, visibleFields ] );
}
