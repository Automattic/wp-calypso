import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { getFieldDefinitions } from '../field-definitions';
import type { ViewState } from '../data-views-types';
import type { BillingTransaction } from 'calypso/state/billing-transactions/types';

export function useFieldDefinitions( transactions: BillingTransaction[] | null, view: ViewState ) {
	const translate = useTranslate();

	return useMemo( () => {
		const fieldDefinitions = getFieldDefinitions( transactions, view.hiddenFields, translate );
		return view.fields.map(
			( fieldId ) => fieldDefinitions[ fieldId as keyof typeof fieldDefinitions ]
		);
	}, [ transactions, view.hiddenFields, view.fields, translate ] );
}
