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

// --- Explicit state machine ---

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

// --- Public interface ---

export interface VersionSwitchState {
	backupState: BackupState;
	phase: Phase;
	mutation: ReturnType< typeof useMutation< void, Error, string > >;
}

export function useVersionSwitch( site: Site ): VersionSwitchState {
	const backupState = useBackupState( site.ID );
	const [ phase, dispatch ] = useReducer( reducer, { status: 'idle' } );

	// Check if there's a pending version switch.
	const { data: pendingVersion } = useQuery( sitePendingWordPressVersionQuery( site.ID ) );
	const isSwitching = !! pendingVersion;
	const wasSwitching = usePrevious( isSwitching );

	// Pending version appeared → switching.
	useEffect( () => {
		if ( pendingVersion ) {
			dispatch( { type: 'SWITCH_STARTED', targetVersion: pendingVersion } );
		}
	}, [ pendingVersion ] );

	// Pending version cleared → switched.
	useEffect( () => {
		if ( wasSwitching && ! isSwitching ) {
			dispatch( { type: 'SWITCH_COMPLETED' } );
			queryClient.invalidateQueries( siteWordPressVersionQuery( site.ID ) );
			queryClient.invalidateQueries( siteBySlugQuery( site.slug ) );
		}
	}, [ wasSwitching, isSwitching, site.ID, site.slug ] );

	// Poll backups while switching.
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

	const deferUntilBackupComplete = isEnabled( 'dashboard/wp-beta-program' );

	const mutation = useMutation( {
		...siteWordPressVersionMutation( site.ID, { deferUntilBackupComplete } ),
		onSuccess: ( _data, version ) => {
			backupState.setEnqueued( true );
			dispatch( { type: 'VERSION_CHANGE_REQUESTED', targetVersion: version } );
			queryClient.invalidateQueries( sitePendingWordPressVersionQuery( site.ID ) );
		},
		meta: {
			snackbar: {
				error: __( 'Failed to save WordPress version.' ),
			},
		},
	} );

	return { backupState, phase, mutation };
}
