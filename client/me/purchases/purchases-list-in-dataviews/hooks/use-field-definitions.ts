import { useTranslate } from 'i18n-calypso';
import { useMemo } from 'react';
import { useLocalizedMoment } from 'calypso/components/localized-moment';
import { getPurchasesFieldDefinitions } from '../purchases-data-field';

export function usePurchasesFieldDefinitions() {
	const translate = useTranslate();
	const moment = useLocalizedMoment();

	return useMemo( () => {
		const fieldDefinitions = getPurchasesFieldDefinitions( { translate, moment } );
		return fieldDefinitions;
	}, [ translate, moment ] );
}
