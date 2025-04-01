import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { getTransactionFieldDefinitions } from './billing-history/field-definitions';
import type { Purchases } from '@automattic/data-stores';
import type { BillingTransaction } from 'calypso/state/billing-transactions/types';

function getFieldDefinitionsByType( {
	itemType,
	items,
	translate
}: {
	itemType: string | null;
	items: BillingTransaction[] | Purchases.Purchase[] | null;
	translate: typeof useTranslate;
} ) {
	if ( 'null' !== itemType || ! items ) {
		return [];
	}

	if ( 'BillingTransaction' === itemType ) {
		return getTransactionFieldDefinitions( items, translate );
	}

	// Eventually, the goal is to add more item types like this
	/*
	if ( 'Purchases.Purchase' === itemType ) {
		return getPurchaseFieldDefinitions( items, translate );
	}
	*/
}

export function useFieldDefinitions( props: {
	items: BillingTransaction[] | Purchases.Purchase[] | null;
} ) {
	const translate = useTranslate();
	const items = props.items;
	if ( ! items ) {
		return [];
	}

	return useMemo( () => {
		const firstItem = items[0] ?? null;
		fieldDefinitions = getFieldDefinitionsByType( { typeof firstItem, items, translate } );
		return Object.values( fieldDefinitions );
	}, [ items, translate ] );
}
