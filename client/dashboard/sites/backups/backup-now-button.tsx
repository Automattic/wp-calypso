import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Button, Tooltip } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useCallback, useEffect, useState } from 'react';
import { siteBackupsQuery } from '../../app/queries/site-backups';
import { enqueueSiteBackup, type BackupEntry } from '../../data/site-backup';
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
		mutationFn: () => enqueueSiteBackup( site.ID ),
		onSuccess: () => {
			setIsEnqueued( true );
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

	const getButtonContent = useCallback( ( state: BackupState ) => {
		switch ( state ) {
			case 'in_progress':
				return __( 'Backup in progress' );
			case 'enqueued':
				return __( 'Backup queued' );
			default:
				return __( 'Back up now' );
		}
	}, [] );

	const getTooltipText = useCallback( ( state: BackupState ) => {
		switch ( state ) {
			case 'in_progress':
				return __( 'A backup is currently in progress.' );
			case 'enqueued':
				return __( 'A backup has been queued and will start shortly.' );
			default:
				return __( 'Create a backup of your site now.' );
		}
	}, [] );

	const isBusy = backupState !== 'default' || isPending;

	const button = (
		<Button
			variant="secondary"
			onClick={ () => triggerBackup() }
			disabled={ isBusy }
			isBusy={ isBusy }
		>
			{ getButtonContent( backupState ) }
		</Button>
	);

	return <Tooltip text={ getTooltipText( backupState ) }>{ button }</Tooltip>;
}
