import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { getTransactionFieldDefinitions } from './billing-history/field-definitions';
import type { BillingTransaction } from 'calypso/state/billing-transactions/types';

export function useFieldDefinitions( transactions: BillingTransaction[] | null ) {
	const translate = useTranslate();

	return useMemo( () => {
		const fieldDefinitions = getTransactionFieldDefinitions( transactions, translate );
		return Object.values( fieldDefinitions );
	}, [ transactions, translate ] );
}
