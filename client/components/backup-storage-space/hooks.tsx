import { useTranslate, TranslateResult } from 'i18n-calypso';
import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { recordTracksEvent } from 'calypso/state/analytics/actions/record';
import getJetpackStorageUpgradeUrl from 'calypso/state/plans/selectors/get-jetpack-storage-upgrade-url';
import getSelectedSiteSlug from 'calypso/state/ui/selectors/get-selected-site-slug';

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
	const dispatch = useDispatch();

	const siteSlug = useSelector( getSelectedSiteSlug );
	const storageUpgradeUrl = useSelector( ( state ) =>
		getJetpackStorageUpgradeUrl( state, siteSlug )
	);

	const onClick = useCallback( () => {
		dispatch(
			recordTracksEvent( 'calypso_jetpack_backup_storage_usage_upgrade_click', {
				bytes_used: bytesUsed,
				bytes_available: bytesAvailable,
			} )
		);
	}, [ dispatch, bytesUsed, bytesAvailable ] );

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
				'%(usedGigabytes).1fGB used of %(availableUnitAmount)dGB - {{a}}Upgrade{{/a}}',
				'%(usedGigabytes).1fGB used of %(availableUnitAmount)dGB - {{a}}Upgrade{{/a}}',
				{
					count: usedGigabytes,
					args: { usedGigabytes, availableUnitAmount },
					comment:
						'Must use unit abbreviation; describes used vs available storage amounts (e.g., 20.0GB of 30GB used, 0.5GB of 20GB used)',
					components: {
						a: <a onClick={ onClick } href={ storageUpgradeUrl } />,
					},
				}
			);
		}

		return translate(
			'%(usedGigabytes).1fGB used of %(availableUnitAmount)dTB',
			'%(usedGigabytes).1fGB used of %(availableUnitAmount)dTB',
			{
				count: usedGigabytes,
				args: { usedGigabytes, availableUnitAmount },
				comment:
					'Must use unit abbreviation; describes used vs available storage amounts (e.g., 20.0GB of 1TB used, 0.5GB of 2TB used)',
			}
		);
	}, [ translate, storageUpgradeUrl, bytesUsed, bytesAvailable, onClick ] );
};
