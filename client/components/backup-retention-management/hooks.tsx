import { useMemo } from '@wordpress/element';
import { useSelector } from 'react-redux';
import { useStorageText } from 'calypso/components/backup-storage-space/hooks';
import getBackupCurrentSiteSize from 'calypso/state/rewind/selectors/get-backup-current-site-size';
import getRewindBytesAvailable from 'calypso/state/rewind/selectors/get-rewind-bytes-available';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { STORAGE_ESTIMATION_ADDITIONAL_BUFFER } from './constants';
import type { RetentionRadioOptionType } from './types';

/**
 * Estimate the current site size based on the last backup size, adding a 25% buffer
 */
export function useEstimatedCurrentSiteSize(): number {
	const siteId = useSelector( getSelectedSiteId ) as number;
	const lastBackupSize = useSelector(
		( state ) => getBackupCurrentSiteSize( state, siteId ) as number
	);
	return useMemo(
		() => lastBackupSize + lastBackupSize * STORAGE_ESTIMATION_ADDITIONAL_BUFFER,
		[ lastBackupSize ]
	);
}

/**
 * Estimate the space needed based on the current site size and the retention days
 *
 * @param currentSiteSizeInBytes Current site size in bytes
 * @param desiredRetentionDays   Desired backup retention days
 * @returns Space needed in bytes
 */
export function useEstimateSpaceNeeded(
	currentSiteSizeInBytes: number,
	desiredRetentionDays: number
): number {
	return useMemo( () => {
		return currentSiteSizeInBytes * desiredRetentionDays;
	}, [ currentSiteSizeInBytes, desiredRetentionDays ] );
}

/**
 * Prepare the retention options for the RetentionOptionsControl component
 */
export function usePrepareRetentionOptions(
	label: string,
	desiredRetentionDays: number,
	currentRetentionPlan: number,
	checked: boolean
): RetentionRadioOptionType {
	const siteId = useSelector( getSelectedSiteId ) as number;
	const currentSiteSizeInBytes = useEstimatedCurrentSiteSize();

	const storageLimitBytes = useSelector( ( state ) =>
		getRewindBytesAvailable( state, siteId )
	) as number;

	const spaceNeeded = useEstimateSpaceNeeded( currentSiteSizeInBytes, desiredRetentionDays );
	const spaceNeededText = useStorageText( spaceNeeded );

	return useMemo( () => {
		return {
			label,
			spaceNeeded: spaceNeededText,
			upgradeRequired: spaceNeeded > storageLimitBytes,
			isCurrentPlan: desiredRetentionDays === currentRetentionPlan,
			value: desiredRetentionDays,
			checked,
		};
	}, [
		label,
		spaceNeededText,
		spaceNeeded,
		storageLimitBytes,
		desiredRetentionDays,
		currentRetentionPlan,
		checked,
	] );
}
