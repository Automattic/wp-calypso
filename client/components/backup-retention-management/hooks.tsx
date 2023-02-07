import { useMemo } from '@wordpress/element';
import { useSelector } from 'react-redux';
import { useStorageText } from 'calypso/components/backup-storage-space/hooks';
import getActivityLogVisibleDays from 'calypso/state/rewind/selectors/get-activity-log-visible-days';
import getRewindBytesAvailable from 'calypso/state/rewind/selectors/get-rewind-bytes-available';
import { getSelectedSiteId } from 'calypso/state/ui/selectors';
import { RetentionRadioOptionType } from './consts';

/**
 * Estimate the current site size based on the last backup size, adding a 25% buffer
 */
export function useEstimatedCurrentSiteSize(): number {
	const lastBackupSize = 2 ** 30; // @TODO: Fetch this from #73031 when it's ready. We will need to call getBackupCurrentSiteSize() from the state.
	return useMemo( () => lastBackupSize + lastBackupSize * 0.25, [ lastBackupSize ] );
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
	checked: boolean
): RetentionRadioOptionType {
	const siteId = useSelector( getSelectedSiteId ) as number;
	const currentSiteSizeInBytes = useEstimatedCurrentSiteSize();

	const storageLimitBytes = useSelector( ( state ) =>
		getRewindBytesAvailable( state, siteId )
	) as number;

	const planRetentionPeriod = useSelector( ( state ) =>
		getActivityLogVisibleDays( state, siteId )
	);

	const spaceNeeded = useEstimateSpaceNeeded( currentSiteSizeInBytes, desiredRetentionDays );
	const spaceNeededText = useStorageText( spaceNeeded );

	return useMemo( () => {
		return {
			label,
			spaceNeeded: spaceNeededText,
			upgradeRequired: spaceNeeded > storageLimitBytes,
			isCurrentPlan: desiredRetentionDays === planRetentionPeriod,
			value: desiredRetentionDays,
			checked,
		};
	}, [
		label,
		spaceNeededText,
		spaceNeeded,
		storageLimitBytes,
		desiredRetentionDays,
		planRetentionPeriod,
		checked,
	] );
}
