import { useTranslate, TranslateResult } from 'i18n-calypso';
import { useMemo } from 'react';

enum StorageUnits {
	Gigabyte = 2 ** 30,
	Terabyte = 2 ** 40,
}

const getAppropriateStorageUnit = ( bytes: number ): StorageUnits => {
	if ( bytes < StorageUnits.Terabyte ) {
		return StorageUnits.Gigabyte;
	}

	return StorageUnits.Terabyte;
};

const bytesToUnit = ( bytes: number, unit: StorageUnits ) => bytes / unit;

export const useStorageUsageText = (
	bytesUsed: number | undefined,
	bytesAvailable: number | undefined
): TranslateResult | null => {
	const translate = useTranslate();

	return useMemo( () => {
		if ( bytesUsed === undefined ) {
			return null;
		}

		const usedGigabytes = bytesToUnit( bytesUsed, StorageUnits.Gigabyte );

		if ( bytesAvailable === undefined ) {
			return translate( '%(usedGigabytes).1fGB used', '%(usedGigabytes).1fGB used', {
				count: usedGigabytes,
				args: { usedGigabytes },
				comment:
					'Must use unit abbreviation; describes an amount of storage space in gigabytes (e.g., 15.4GB used)',
			} );
		}

		const availableUnit = getAppropriateStorageUnit( bytesAvailable );
		const availableUnitAmount = bytesToUnit( bytesAvailable, availableUnit );

		if ( availableUnit === StorageUnits.Gigabyte ) {
			return translate(
				'%(usedGigabytes).1fGB of %(availableUnitAmount)dGB used',
				'%(usedGigabytes).1fGB of %(availableUnitAmount)dGB used',
				{
					count: usedGigabytes,
					args: { usedGigabytes, availableUnitAmount },
					comment:
						'Must use unit abbreviation; describes used vs available storage amounts (e.g., 20.0GB of 30GB used, 0.5GB of 20GB used)',
				}
			);
		}

		return translate(
			'%(usedGigabytes).1fGB of %(availableUnitAmount)dTB used',
			'%(usedGigabytes).1fGB of %(availableUnitAmount)dTB used',
			{
				count: usedGigabytes,
				args: { usedGigabytes, availableUnitAmount },
				comment:
					'Must use unit abbreviation; describes used vs available storage amounts (e.g., 20.0GB of 1TB used, 0.5GB of 2TB used)',
			}
		);
	}, [ translate, bytesUsed, bytesAvailable ] );
};
