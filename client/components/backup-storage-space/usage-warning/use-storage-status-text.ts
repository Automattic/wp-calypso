import { useTranslate, TranslateResult } from 'i18n-calypso';
import { useMemo } from 'react';
import { StorageUsageLevels } from '../storage-usage-levels';

const useStorageStatusText = ( usageLevel: StorageUsageLevels ): TranslateResult | null => {
	const translate = useTranslate();

	// TODO: For StorageUsageLevels.Warning, estimate how many days until
	// all storage is used, and show that in the status text.
	return useMemo( () => {
		switch ( usageLevel ) {
			case StorageUsageLevels.Warning:
				return translate( 'You will reach your storage limit soon.' );
			case StorageUsageLevels.Critical:
				return translate( "You're running out of storage space." );
			case StorageUsageLevels.Full:
				return translate( 'You ran out of storage space.' );
		}

		return null;
	}, [ translate, usageLevel ] );
};

export default useStorageStatusText;
