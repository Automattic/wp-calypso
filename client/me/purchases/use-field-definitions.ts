import { Fields } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { getTransactionFieldDefinitions } from './billing-history/field-definitions';
import type { Purchases } from '@automattic/data-stores';
import type { BillingTransaction } from 'calypso/state/billing-transactions/types';
import type { LocalizeProps } from 'i18n-calypso';

function getFieldDefinitionsByType< DataFields extends BillingTransaction | Purchases.Purchase >( {
	itemType,
	items,
	translate,
}: {
	itemType: string | null;
	items: DataFields[];
	translate: LocalizeProps[ 'translate' ];
} ): Fields< DataFields[] > {
	if ( ! items ) {
		return [];
	}

	if ( 'BillingTransaction' === itemType && 'subtotal_integer' in items[ 0 ] ) {
		return Object.values( getTransactionFieldDefinitions( items, translate ) );
	}

	// Eventually, the goal is to add more item types like this
	/*
	if ( 'Purchase' === itemType ) {
		return getPurchaseFieldDefinitions( items, translate );
	}
	*/
}

export function useFieldDefinitions( props: {
	items: BillingTransaction[] | Purchases.Purchase[] | null;
	itemType: 'BillingTransaction' | 'Purchase';
} ) {
	const translate = useTranslate();

	return useMemo( () => {
		const fieldDefinitions = getFieldDefinitionsByType( {
			itemType: props.itemType,
			items: props.items,
			translate,
		} );
		return fieldDefinitions;
	}, [ props.items, translate ] );
}
