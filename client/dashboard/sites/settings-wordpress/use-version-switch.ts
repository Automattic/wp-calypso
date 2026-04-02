import {
	queryClient,
	siteBackupsQuery,
	siteBySlugQuery,
	sitePendingWordPressVersionQuery,
	siteWordPressVersionQuery,
	siteWordPressVersionMutation,
} from '@automattic/api-queries';
import { useQuery, useMutation } from '@tanstack/react-query';
import { usePrevious } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { useBackupState } from '../backups/use-backup-state';
import type { BackupState } from '../backups/use-backup-state';
import type { Site } from '@automattic/api-core';

export interface VersionSwitchState {
	backupState: BackupState;
	/** The pending version tag while switching, or the last one after switch completes. */
	targetVersion: string;
	isSwitching: boolean;
	isSwitched: boolean;
	mutation: ReturnType< typeof useMutation< void, Error, string > >;
}

export function useVersionSwitch( site: Site ): VersionSwitchState {
	const backupState = useBackupState( site.ID );

	// Check if there's a pending version switch.
	const { data: pendingVersion } = useQuery( sitePendingWordPressVersionQuery( site.ID ) );
	const isSwitching = !! pendingVersion;
	const wasSwitching = usePrevious( isSwitching );
	const [ isSwitched, setIsSwitched ] = useState( false );
	const [ targetVersion, setTargetVersion ] = useState( '' );

	// Remember the pending version so we can show it in the success notice.
	useEffect( () => {
		if ( pendingVersion ) {
			setTargetVersion( pendingVersion );
		}
	}, [ pendingVersion ] );

	// Track the transition from switching to not switching.
	useEffect( () => {
		if ( wasSwitching && ! isSwitching ) {
			setIsSwitched( true );
			queryClient.invalidateQueries( siteWordPressVersionQuery( site.ID ) );
			queryClient.invalidateQueries( siteBySlugQuery( site.slug ) );
		}
	}, [ wasSwitching, isSwitching, site.ID, site.slug ] );

	// Poll backups while a version switch is in progress.
	useQuery( {
		...siteBackupsQuery( site.ID ),
		refetchInterval: isSwitching ? 3000 : false,
		enabled: isSwitching,
	} );

	// After backup completes, poll pending version until it clears.
	useQuery( {
		...sitePendingWordPressVersionQuery( site.ID ),
		refetchInterval: isSwitching && backupState.hasRecentlyCompleted ? 5000 : false,
	} );

	const mutation = useMutation( {
		...siteWordPressVersionMutation( site.ID ),
		onSuccess: () => {
			backupState.setEnqueued( true );
			setIsSwitched( false );
			queryClient.invalidateQueries( sitePendingWordPressVersionQuery( site.ID ) );
		},
		meta: {
			snackbar: {
				error: __( 'Failed to save WordPress version.' ),
			},
		},
	} );

	return {
		backupState,
		targetVersion,
		isSwitching,
		isSwitched,
		mutation,
	};
}
