import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { getFieldDefinitions } from '../field-definitions';
import type { BillingTransaction } from 'calypso/state/billing-transactions/types';

export function useFieldDefinitions( transactions: BillingTransaction[] | null ) {
	const translate = useTranslate();

	return useMemo( () => {
		const fieldDefinitions = getFieldDefinitions( transactions, translate );
		return Object.values( fieldDefinitions );
	}, [ transactions, translate ] );
}
