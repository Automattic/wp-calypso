import { Action } from 'redux';
import { REWIND_STORAGE_USAGE_LEVEL_SET } from 'calypso/state/action-types';
import { StorageUsageLevelName } from './types';

type RequestActionType = Action< typeof REWIND_STORAGE_USAGE_LEVEL_SET > & {
	siteId: number | null;
	usageLevel: StorageUsageLevelName;
};

export const setUsageLevel = (
	siteId: number | null,
	usageLevel: StorageUsageLevelName
): RequestActionType => ( {
	type: REWIND_STORAGE_USAGE_LEVEL_SET,
	siteId,
	usageLevel,
} );
