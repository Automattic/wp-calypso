import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { useBackupState } from '../../app/hooks/site-backup-state';
import { siteBackupEnqueueMutation, siteBackupsQuery } from '../../app/queries/site-backups';
import type { Site } from '../../data/types';

interface BackupNowButtonProps {
	site: Site;
}

export function BackupNowButton( { site }: BackupNowButtonProps ) {
	const [ isEnqueued, setIsEnqueued ] = useState( false );
	const { status } = useBackupState( site.ID );
	const isRunning = status === 'running';

	// Enqueue a new backup
	const { mutate: triggerBackup, isPending } = useMutation( {
		...siteBackupEnqueueMutation( site.ID ),
		onMutate: () => {
			setIsEnqueued( true );
		},
	} );

	// Lets fetch backups if we just enqueued a backup or if there's a backup running
	useQuery( {
		...siteBackupsQuery( site.ID ),
		refetchInterval: isRunning || isEnqueued ? 2000 : false,
	} );

	// Reset enqueued state when backup actually starts
	useEffect( () => {
		if ( isRunning && isEnqueued ) {
			setIsEnqueued( false );
		}
	}, [ status, isEnqueued, isRunning ] );

	// Generate button content based on backup status
	const getButtonContent = () => {
		// Show enqueued state only for this button when it triggered the backup
		if ( isEnqueued ) {
			return {
				label: __( 'Backup enqueued' ),
				tooltip: __( 'A backup has been queued and will start shortly.' ),
			};
		}

		if ( status === 'running' ) {
			return {
				label: __( 'Backup in progress' ),
				tooltip: __( 'A backup is currently in progress.' ),
			};
		}

		return {
			label: __( 'Back up now' ),
			tooltip: __( 'Create a backup of your site now.' ),
		};
	};

	const isBusy = isRunning || isPending || isEnqueued;

	return (
		<Button
			variant="secondary"
			onClick={ () => triggerBackup() }
			disabled={ isBusy }
			isBusy={ isBusy }
			accessibleWhenDisabled
			description={ getButtonContent().tooltip }
			label={ getButtonContent().label }
			showTooltip
		>
			{ getButtonContent().label }
		</Button>
	);
}
