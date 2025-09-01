import { useMutation } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import { useBackupState } from '../../app/hooks/site-backup-state';
import { siteBackupEnqueueMutation } from '../../app/queries/site-backups';
import type { Site } from '@automattic/api-core';

interface BackupNowButtonProps {
	site: Site;
}

export function BackupNowButton( { site }: BackupNowButtonProps ) {
	const [ isEnqueued, setIsEnqueued ] = useState( false );

	const { backupState, isBackupActive } = useBackupState( site.ID, isEnqueued );

	const { mutate: triggerBackup, isPending } = useMutation( {
		...siteBackupEnqueueMutation( site.ID ),
		onMutate: () => {
			setIsEnqueued( true );
		},
	} );

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

	const isBusy = isBackupActive || isPending;

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
