import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Tooltip } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback, useEffect, useState } from 'react';
import { siteBackupsQuery } from '../../app/queries/site-backups';
import { enqueueSiteBackup } from '../../data/site-backup';
import { type BackupEntry } from '../../data/site-backups';
import type { Site } from '../../data/types';

interface BackupNowButtonProps {
	site: Site;
}

type BackupState = 'default' | 'enqueued' | 'in_progress';

export function BackupNowButton( { site }: BackupNowButtonProps ) {
	const [ isEnqueued, setIsEnqueued ] = useState( false );
	const queryClient = useQueryClient();

	// Determine current state
	const getBackupState = useCallback(
		( backups: BackupEntry[], enqueued: boolean ): BackupState => {
			const currentBackup = backups[ 0 ];
			if ( currentBackup?.status === 'started' ) {
				return 'in_progress';
			}
			if ( currentBackup?.status === 'queued' || enqueued ) {
				return 'enqueued';
			}
			return 'default';
		},
		[]
	);

	// Check for in-progress backup using rewind/backups endpoint
	const { data: rewindBackups = [] } = useQuery( {
		...siteBackupsQuery( site.ID ),
		refetchInterval: ( query ) => {
			const backups = query.state.data || [];
			const backupState = getBackupState( backups, isEnqueued );
			// Poll when backup is enqueued or in progress
			return backupState !== 'default' ? 2000 : false;
		},
	} );

	const { mutate: triggerBackup, isPending } = useMutation( {
		mutationFn: () => {
			setIsEnqueued( true );
			return enqueueSiteBackup( site.ID );
		},
		onSuccess: () => {
			// Refresh rewind backups to check for new backup status
			queryClient.invalidateQueries( {
				queryKey: [ 'site', site.ID, 'rewind', 'backups' ],
			} );
		},
		onError: () => {
			// Lets decide later what to do here
		},
	} );

	const backupState = getBackupState( rewindBackups, isEnqueued );

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

	const button = (
		<Button
			variant="secondary"
			onClick={ () => triggerBackup() }
			disabled={ isBusy }
			isBusy={ isBusy }
		>
			{ buttonContent[ backupState ].label }
		</Button>
	);

	return <Tooltip text={ buttonContent[ backupState ].tooltip }>{ button }</Tooltip>;
}
