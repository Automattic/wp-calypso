import { Purchases } from '@automattic/data-stores';
import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { getPurchasesFieldDefinitions } from '../purchases-data-field';

export function usePurchasesFieldDefinitions( purchases: Purchases.Purchase[] | null ) {
	const translate = useTranslate();

	return useMemo( () => {
		const fieldDefinitions = getPurchasesFieldDefinitions( purchases, translate );
		return fieldDefinitions;
	}, [ purchases, translate ] );
}
