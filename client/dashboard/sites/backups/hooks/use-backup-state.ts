import {
	type BackupEntry,
	BackupEntryStatuses,
	BackupEntryErrorStatuses,
} from '@automattic/api-core';
import { siteBackupsQuery } from '@automattic/api-queries';
import { useQuery } from '@tanstack/react-query';
import { useRef, useState, useCallback, useEffect } from 'react';

export type BackupStateType = 'idle' | 'enqueued' | 'running' | 'success' | 'error';

export interface BackupState {
	// Current status of the tracked backup
	status: BackupStateType;

	// The specific backup being tracked (if any)
	backup: BackupEntry | null;

	// Whether the backup has recently completed successfully
	hasRecentlyCompleted: boolean;

	// Function to set enqueue state
	setEnqueued: ( isEnqueued: boolean ) => void;
}

/**
 * Tracks a specific backup through its lifecycle from start to completion/error.
 *
 * - When a backup starts (or is already in progress), we track it by its `period`
 * - We follow that specific backup until it succeeds or fails
 */
export function useBackupState( siteId: number ): BackupState {
	const trackedBackupRef = useRef< BackupEntry[ 'period' ] | null >( null );
	const [ isEnqueued, setIsEnqueued ] = useState( false );

	const setEnqueued = useCallback( ( enqueued: boolean ) => {
		setIsEnqueued( enqueued );
	}, [] );

	const { data: backups = [] } = useQuery( siteBackupsQuery( siteId ) );

	const latestBackup = backups[ 0 ];
	const isRunning = latestBackup?.status === BackupEntryStatuses.STARTED;

	// Reset enqueued state when backup actually starts (similar to scan implementation)
	useEffect( () => {
		if ( isRunning ) {
			setIsEnqueued( false );
		}
	}, [ isRunning ] );

	// Get current backup status and decide what to track
	const getBackupState = ( backups: BackupEntry[] ): BackupState => {
		if ( isEnqueued ) {
			return {
				status: 'enqueued',
				backup: null,
				hasRecentlyCompleted: false,
				setEnqueued,
			};
		}

		// If we have a tracked backup, check its current status
		if ( trackedBackupRef.current ) {
			const tracked = backups.find( ( b ) => b.period === trackedBackupRef.current );

			if ( tracked ) {
				if ( tracked.status === BackupEntryStatuses.STARTED ) {
					return {
						status: 'running',
						backup: tracked,
						hasRecentlyCompleted: false,
						setEnqueued,
					};
				}

				if ( tracked.status === BackupEntryStatuses.FINISHED ) {
					return {
						status: 'success',
						backup: tracked,
						hasRecentlyCompleted: true,
						setEnqueued,
					};
				}

				if ( Object.values( BackupEntryErrorStatuses ).includes( tracked.status ) ) {
					return {
						status: 'error',
						backup: tracked,
						hasRecentlyCompleted: false,
						setEnqueued,
					};
				}
			}
		}

		// Check if there's a backup currently in progress (and start tracking it)
		if ( latestBackup?.status === BackupEntryStatuses.STARTED ) {
			// Start tracking this backup if we're not already tracking one
			if ( ! trackedBackupRef.current || trackedBackupRef.current !== latestBackup.period ) {
				trackedBackupRef.current = latestBackup.period;
			}

			return {
				status: 'running',
				backup: latestBackup,
				hasRecentlyCompleted: false,
				setEnqueued,
			};
		}

		// No active or tracked backup
		return {
			status: 'idle',
			backup: null,
			hasRecentlyCompleted: false,
			setEnqueued,
		};
	};

	return getBackupState( backups );
}
