import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { getPurchasesFieldDefinitions } from '../purchases-data-field';

export function usePurchasesFieldDefinitions() {
	const translate = useTranslate();

	return useMemo( () => {
		const fieldDefinitions = getPurchasesFieldDefinitions( translate );
		return fieldDefinitions;
	}, [ translate ] );
}
