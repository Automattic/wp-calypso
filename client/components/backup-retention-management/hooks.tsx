import { STORAGE_ESTIMATION_ADDITIONAL_BUFFER } from './constants';

/**
 * Estimate the current site size based on the last backup size, adding a 25% buffer
 */
export function getEstimatedCurrentSiteSize( lastBackupSize: number ): number {
	return lastBackupSize + lastBackupSize * STORAGE_ESTIMATION_ADDITIONAL_BUFFER;
}

/**
 * Estimate the space needed based on the current site size and the retention days
 *
 * @param currentSiteSizeInBytes Current site size in bytes
 * @param desiredRetentionDays   Desired backup retention days
 * @returns Space needed in bytes
 */
export function getSpaceNeededInBytes(
	currentSiteSizeInBytes: number,
	desiredRetentionDays: number
): number {
	return currentSiteSizeInBytes * desiredRetentionDays;
}
