import { useQuery } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { type BackupEntry } from '../../data/site-backups';
import { siteBackupsQuery } from '../queries/site-backups';

export type BackupState = 'default' | 'enqueued' | 'in_progress';

interface BackupStateResult {
	backupState: BackupState;
	isBackupActive: boolean;
	hasRecentlyCompleted: boolean;
}

export function useBackupState( siteId: number, isEnqueued = false ): BackupStateResult {
	const [ hasRecentlyCompleted, setHasRecentlyCompleted ] = useState( false );
	const [ previousBackupState, setPreviousBackupState ] = useState< BackupState >( 'default' );

	// Determine current backup state from backup entries
	const getBackupState = useCallback(
		( backups: BackupEntry[] ): BackupState => {
			const currentBackup = backups[ 0 ];
			if ( currentBackup?.status === 'started' ) {
				return 'in_progress';
			}
			if ( currentBackup?.status === 'queued' || isEnqueued ) {
				return 'enqueued';
			}
			return 'default';
		},
		[ isEnqueued ]
	);

	// Query backup status with polling during active operations
	const { data: rewindBackups = [] } = useQuery( {
		...siteBackupsQuery( siteId ),
		refetchInterval: ( query ) => {
			const backups = query.state.data || [];
			const backupState = getBackupState( backups );
			// Poll when backup is enqueued or in progress
			return backupState !== 'default' ? 2000 : false;
		},
	} );

	const backupState = getBackupState( rewindBackups );
	const isBackupActive = backupState !== 'default';

	// Track when backup transitions from in_progress to default (completion)
	useEffect( () => {
		if ( previousBackupState === 'in_progress' && backupState === 'default' ) {
			setHasRecentlyCompleted( true );

			// Stop tracking completion after timeout
			const timeoutId = setTimeout( () => {
				setHasRecentlyCompleted( false );
			}, 30000 );

			return () => clearTimeout( timeoutId );
		}
		setPreviousBackupState( backupState );
	}, [ backupState, previousBackupState ] );

	return {
		backupState,
		isBackupActive,
		hasRecentlyCompleted,
	};
}
