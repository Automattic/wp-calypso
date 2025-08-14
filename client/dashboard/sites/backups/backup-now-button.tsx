import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback, useEffect, useState } from 'react';
import { siteBackupEnqueueMutation, siteBackupsQuery } from '../../app/queries/site-backups';
import { type BackupEntry } from '../../data/site-backups';
import type { Site } from '../../data/types';

interface BackupNowButtonProps {
	site: Site;
}

type BackupState = 'default' | 'enqueued' | 'in_progress';

export function BackupNowButton( { site }: BackupNowButtonProps ) {
	const [ isEnqueued, setIsEnqueued ] = useState( false );

	// Determine current state
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

	// Check for in-progress backup using rewind/backups endpoint
	const { data: rewindBackups = [] } = useQuery( {
		...siteBackupsQuery( site.ID ),
		refetchInterval: ( query ) => {
			const backups = query.state.data || [];
			const backupState = getBackupState( backups );
			// Poll when backup is enqueued or in progress
			return backupState !== 'default' ? 2000 : false;
		},
	} );

	const { mutate: triggerBackup, isPending } = useMutation( {
		...siteBackupEnqueueMutation( site.ID ),
		onMutate: () => {
			setIsEnqueued( true );
		},
	} );

	const backupState = getBackupState( rewindBackups );

	// Reset enqueued state when backup actually starts
	useEffect( () => {
		if ( backupState === 'in_progress' && isEnqueued ) {
			setIsEnqueued( false );
		}
	}, [ backupState, isEnqueued ] );

	const buttonContent = {
		enqueued: {
			label: __( 'Backup enqueued' ),
			tooltip: __( 'A backup has been queued and will start shortly.' ),
		},
		in_progress: {
			label: __( 'Backup in progress' ),
			tooltip: __( 'A backup is currently in progress.' ),
		},
		default: {
			label: __( 'Back up now' ),
			tooltip: __( 'Create a backup of your site now.' ),
		},
	};

	const isBusy = backupState !== 'default' || isPending;

	return (
		<Button
			variant="secondary"
			onClick={ () => triggerBackup() }
			disabled={ isBusy }
			isBusy={ isBusy }
			accessibleWhenDisabled
			description={ buttonContent[ backupState ].tooltip }
			label={ buttonContent[ backupState ].label }
			showTooltip
		>
			{ buttonContent[ backupState ].label }
		</Button>
	);
}
