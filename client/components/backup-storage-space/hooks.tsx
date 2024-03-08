import { Gridicon } from '@automattic/components';
import { useTranslate, TranslateResult } from 'i18n-calypso';
import { useMemo } from 'react';
import { settingsPath } from 'calypso/lib/jetpack/paths';

export enum StorageUnits {
	Gigabyte = 2 ** 30,
	Terabyte = 2 ** 40,
}

type ConvertedUnitAmount = {
	unitAmount: number;
	unit: StorageUnits;
};

const getAppropriateStorageUnit = ( bytes: number ): StorageUnits => {
	if ( bytes < StorageUnits.Terabyte ) {
		return StorageUnits.Gigabyte;
	}

	return StorageUnits.Terabyte;
};

const bytesToUnit = ( bytes: number, unit: StorageUnits ) => bytes / unit;

export const convertBytesToUnitAmount = ( bytes: number ): ConvertedUnitAmount => {
	const unit = getAppropriateStorageUnit( bytes );
	const unitAmount = bytesToUnit( bytes, unit );
	return { unitAmount, unit };
};

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
			return translate(
				'{{usedStorage}}%(usedGigabytes).1fGB{{/usedStorage}} used',
				'{{usedStorage}}%(usedGigabytes).1fGB{{/usedStorage}} used',
				{
					count: usedGigabytes,
					args: { usedGigabytes },
					comment:
						'Must use unit abbreviation; describes an amount of storage space in gigabytes (e.g., 15.4GB used)',
					components: { usedStorage: <span className="used-space__span" /> },
				}
			);
		}

		const { unitAmount: availableUnitAmount, unit: availableUnit } =
			convertBytesToUnitAmount( bytesAvailable );

		if ( availableUnit === StorageUnits.Gigabyte ) {
			return translate(
				'Using {{usedStorage}}%(usedGigabytes).1fGB{{/usedStorage}} of %(availableUnitAmount)dGB',
				'Using {{usedStorage}}%(usedGigabytes).1fGB{{/usedStorage}} of %(availableUnitAmount)dGB',
				{
					count: usedGigabytes,
					args: { usedGigabytes, availableUnitAmount },
					comment:
						'Must use unit abbreviation; describes used vs available storage amounts (e.g., Using 20.0GB of 30GB, Using 0.5GB of 20GB)',
					components: { usedStorage: <span className="used-space__span" /> },
				}
			);
		}

		if ( availableUnit === StorageUnits.Terabyte && availableUnitAmount % 1 !== 0 ) {
			return translate(
				'Using {{usedStorage}}%(usedGigabytes).1fGB{{/usedStorage}} of %(availableUnitAmount).2fTB',
				'Using {{usedStorage}}%(usedGigabytes).1fGB{{/usedStorage}} of %(availableUnitAmount).2fTB',
				{
					count: usedGigabytes,
					args: { usedGigabytes, availableUnitAmount },
					comment:
						'Must use unit abbreviation; describes used vs available storage amounts (e.g., Using 20.0GB of 1.01TB, Using 0.5GB of 2TB)',
					components: { usedStorage: <span className="used-space__span" /> },
				}
			);
		}

		return translate(
			'Using {{usedStorage}}%(usedGigabytes).1fGB{{/usedStorage}} of %(availableUnitAmount)dTB',
			'Using {{usedStorage}}%(usedGigabytes).1fGB{{/usedStorage}} of %(availableUnitAmount)dTB',
			{
				count: usedGigabytes,
				args: { usedGigabytes, availableUnitAmount },
				comment:
					'Must use unit abbreviation; describes used vs available storage amounts (e.g., Using 20.0GB of 1TB, Using 0.5GB of 2TB)',
				components: { usedStorage: <span className="used-space__span" /> },
			}
		);
	}, [ translate, bytesUsed, bytesAvailable ] );
};

export const useDaysOfBackupsSavedText = (
	daysOfBackupsSaved: number | undefined,
	siteSlug: string
): TranslateResult | null => {
	const translate = useTranslate();

	return useMemo( () => {
		if ( undefined === daysOfBackupsSaved || 0 === daysOfBackupsSaved ) {
			return null;
		}

		const daysOfBackupsSavedLinkTarget = settingsPath( siteSlug );

		return translate(
			'{{a}}%(daysOfBackupsSaved)d day of backups saved {{icon/}}{{/a}}',
			'{{a}}%(daysOfBackupsSaved)d days of backups saved {{icon/}}{{/a}}',
			{
				count: daysOfBackupsSaved,
				args: { daysOfBackupsSaved },
				components: {
					a: <a href={ daysOfBackupsSavedLinkTarget } />,
					icon: <Gridicon icon="cog" size={ 16 } />,
				},
			}
		);
	}, [ translate, daysOfBackupsSaved, siteSlug ] );
};

/**
 * The idea is to convert any storage amount in bytes to a human readable format.
 * @param storageInBytes The storage amount in bytes
 * @returns				 The storage amount in a human readable format
 */
export const useStorageText = ( storageInBytes: number ): TranslateResult | string => {
	const translate = useTranslate();

	return useMemo( () => {
		if ( storageInBytes && storageInBytes >= 0 ) {
			const { unitAmount, unit } = convertBytesToUnitAmount( storageInBytes );

			switch ( unit ) {
				case StorageUnits.Gigabyte:
					if ( unitAmount % 1 === 0 ) {
						return translate( '%(storageInBytes)dGB', {
							args: { storageInBytes: unitAmount },
							comment: 'Must use unit abbreviation; describes an storage amounts (e.g., 20GB)',
						} );
					}

					return translate( '%(storageInBytes).1fGB', {
						args: { storageInBytes: unitAmount },
						comment:
							'Must use unit abbreviation; describes an storage amounts with 1 decimal point (e.g., 20.0GB)',
					} );
				case StorageUnits.Terabyte:
					if ( unitAmount % 1 === 0 ) {
						return translate( '%(storageInBytes)dTB', {
							args: { storageInBytes: unitAmount },
							comment: 'Must use unit abbreviation; describes an storage amounts (e.g., 1TB)',
						} );
					}

					return translate( '%(storageInBytes).2fTB', {
						args: { storageInBytes: unitAmount },
						comment:
							'Must use unit abbreviation; describes an storage amounts with 2 decimal point (e.g., 1.50TB)',
					} );
			}
		}

		return '';
	}, [ translate, storageInBytes ] );
};
