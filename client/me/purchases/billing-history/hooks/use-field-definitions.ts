import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { getFieldDefinitions } from '../field-definitions';
import type { BillingTransaction } from 'calypso/state/billing-transactions/types';

export function useFieldDefinitions(
	transactions: BillingTransaction[] | null,
	getReceiptUrlFor: ( receiptId: string ) => string
) {
	const translate = useTranslate();

	return useMemo( () => {
		return getFieldDefinitions( transactions, translate, getReceiptUrlFor );
	}, [ transactions, translate, getReceiptUrlFor ] );
}
