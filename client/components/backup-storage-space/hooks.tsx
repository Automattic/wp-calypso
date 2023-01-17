import { useTranslate, TranslateResult } from 'i18n-calypso';
import { useMemo } from 'react';

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

		const daysOfBackupsSavedLinkTarget = `/activity-log/${ siteSlug }?group=rewind`;

		return translate(
			'{{a}}%(daysOfBackupsSaved)d day of backup saved{{/a}}',
			'{{a}}%(daysOfBackupsSaved)d days of backups saved{{/a}}',
			{
				count: daysOfBackupsSaved,
				args: { daysOfBackupsSaved },
				components: {
					a: <a href={ daysOfBackupsSavedLinkTarget } />,
				},
			}
		);
	}, [ translate, daysOfBackupsSaved, siteSlug ] );
};
