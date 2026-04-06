import {
	queryClient,
	siteBackupsQuery,
	siteBySlugQuery,
	sitePendingWordPressVersionQuery,
	siteWordPressVersionQuery,
	siteWordPressVersionMutation,
} from '@automattic/api-queries';
import { isEnabled } from '@automattic/calypso-config';
import { useQuery, useMutation } from '@tanstack/react-query';
import { usePrevious } from '@wordpress/compose';
import { __ } from '@wordpress/i18n';
import { useEffect, useReducer } from 'react';
import { useBackupState } from '../backups/use-backup-state';
import type { BackupState } from '../backups/use-backup-state';
import type { Site } from '@automattic/api-core';

export type Phase =
	| { status: 'idle' }
	| { status: 'submitting'; targetVersion: string }
	| { status: 'switching'; targetVersion: string }
	| { status: 'switched'; targetVersion: string };

type Action =
	| { type: 'VERSION_CHANGE_REQUESTED'; targetVersion: string }
	| { type: 'SWITCH_STARTED'; targetVersion: string }
	| { type: 'SWITCH_COMPLETED' };

export function reducer( state: Phase, action: Action ): Phase {
	switch ( action.type ) {
		case 'VERSION_CHANGE_REQUESTED':
			return { status: 'submitting', targetVersion: action.targetVersion };
		case 'SWITCH_STARTED':
			return { status: 'switching', targetVersion: action.targetVersion };
		case 'SWITCH_COMPLETED':
			if ( state.status !== 'switching' ) {
				return state;
			}
			return { status: 'switched', targetVersion: state.targetVersion };
		default:
			return state;
	}
}

export interface VersionSwitchState {
	backupState: BackupState;
	targetVersion: string;
	pendingVersion: string | null | undefined;
	isSwitching: boolean;
	isSwitched: boolean;
	switchedToBeta: boolean;
	switchedToLatest: boolean;
	switchVersion: ( version: string ) => void;
	isSaving: boolean;
}

export function useVersionSwitch( site: Site ): VersionSwitchState {
	const deferUntilBackupComplete =
		isEnabled( 'dashboard/wp-beta-program' ) && ! site.is_wpcom_staging_site;

	const backupState = useBackupState( site.ID );
	const [ phase, dispatch ] = useReducer( reducer, { status: 'idle' } );

	// Check if there's a pending version switch.
	const { data: pendingVersion } = useQuery( {
		...sitePendingWordPressVersionQuery( site.ID ),
		enabled: deferUntilBackupComplete,
	} );
	const hasPendingVersion = deferUntilBackupComplete && !! pendingVersion;
	const hadPendingVersion = usePrevious( hasPendingVersion );

	// Pending version appeared → switching. Also start backup tracking.
	useEffect( () => {
		if ( pendingVersion ) {
			backupState.setEnqueued( true );
			dispatch( { type: 'SWITCH_STARTED', targetVersion: pendingVersion } );
		}
	}, [ pendingVersion ] ); // eslint-disable-line react-hooks/exhaustive-deps

	// Pending version cleared → switched.
	useEffect( () => {
		if ( hadPendingVersion && ! hasPendingVersion ) {
			dispatch( { type: 'SWITCH_COMPLETED' } );
			queryClient.invalidateQueries( siteWordPressVersionQuery( site.ID ) );
			queryClient.invalidateQueries( siteBySlugQuery( site.slug ) );
			queryClient.invalidateQueries( {
				queryKey: [ 'site', site.ID, 'backup-activity-log' ],
			} );
		}
	}, [ hadPendingVersion, hasPendingVersion, site.ID, site.slug ] );

	// Poll backups while a version switch is in progress (including right after mutation fires).
	const shouldPollBackups = phase.status === 'submitting' || hasPendingVersion;
	useQuery( {
		...siteBackupsQuery( site.ID ),
		refetchInterval: shouldPollBackups ? 3000 : false,
		enabled: shouldPollBackups,
	} );

	// After backup completes, poll pending version until it clears.
	useQuery( {
		...sitePendingWordPressVersionQuery( site.ID ),
		refetchInterval: hasPendingVersion && backupState.hasRecentlyCompleted ? 5000 : false,
	} );

	const mutation = useMutation( {
		...siteWordPressVersionMutation( site.ID, { deferUntilBackupComplete } ),
		meta: {
			snackbar: {
				...( ! deferUntilBackupComplete && { success: __( 'WordPress version saved.' ) } ),
				error: __( 'Failed to save WordPress version.' ),
			},
		},
	} );

	const switchVersion = ( version: string ) => {
		if ( deferUntilBackupComplete ) {
			dispatch( { type: 'VERSION_CHANGE_REQUESTED', targetVersion: version } );
		}
		mutation.mutate( version );
	};

	const targetVersion = phase.status !== 'idle' ? phase.targetVersion : '';
	const isSwitched = phase.status === 'switched';

	return {
		backupState,
		targetVersion,
		pendingVersion,
		isSwitching: phase.status === 'submitting' || phase.status === 'switching',
		isSwitched,
		switchedToBeta: isSwitched && phase.targetVersion === 'beta',
		switchedToLatest: isSwitched && phase.targetVersion === 'latest',
		switchVersion,
		isSaving: mutation.isPending,
	};
}
