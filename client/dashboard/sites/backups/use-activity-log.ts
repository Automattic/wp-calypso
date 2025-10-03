import { siteBackupActivityLogEntriesQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { buildTimeRangeForActivityLog } from '../../utils/site-activity-log';
import { useBackupState } from './use-backup-state';
import type { ActivityLogEntry } from '@automattic/api-core';

export interface UseActivityLogOptions {
	siteId: number;
	dateRange?: { start: Date; end: Date };
	timezoneString?: string;
	gmtOffset?: number;
}

export interface UseActivityLogResult {
	activityLog: ActivityLogEntry[];
	isLoadingActivityLog: boolean;
}

/**
 * Returns
 */
export function useActivityLog( {
	siteId,
	timezoneString,
	gmtOffset,
	dateRange,
}: UseActivityLogOptions ): UseActivityLogResult {
	const { backup, hasRecentlyCompleted } = useBackupState( siteId );

	const { after, before } = useMemo( () => {
		if ( ! dateRange ) {
			return { after: undefined, before: undefined };
		}

		return buildTimeRangeForActivityLog(
			dateRange.start,
			dateRange.end,
			timezoneString,
			gmtOffset
		);
	}, [ dateRange, timezoneString, gmtOffset ] );

	const queryResult = useQuery( {
		...siteBackupActivityLogEntriesQuery( siteId, undefined, true, after, before ),
		refetchInterval: ( query ) => {
			if ( ! backup || ! hasRecentlyCompleted ) {
				return false;
			}

			const backupPeriod = parseInt( backup.period, 10 );
			if ( isNaN( backupPeriod ) ) {
				return false;
			}

			const successFullBackup = query.state.data?.current?.orderedItems?.some(
				( entry ) => entry?.object?.backup_period === backupPeriod
			);

			return successFullBackup ? false : 3000;
		},
	} );

	return {
		activityLog: queryResult.data ?? [],
		isLoadingActivityLog: queryResult.isLoading,
	};
}
