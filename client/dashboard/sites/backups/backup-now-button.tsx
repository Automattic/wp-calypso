import { siteBackupEnqueueMutation, siteBackupsQuery } from '@automattic/api-queries';
import { useMutation, useQuery } from '@tanstack/react-query';
import { Button } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useAnalytics } from '../../app/analytics';
import type { BackupState } from './use-backup-state';
import type { Site } from '@automattic/api-core';

interface BackupNowButtonProps {
	site: Site;
	backupState: BackupState;
}

export function BackupNowButton( { site, backupState }: BackupNowButtonProps ) {
	const { recordTracksEvent } = useAnalytics();

	const { status, setEnqueued } = backupState;
	const isRunning = status === 'running';
	const isEnqueued = status === 'enqueued';

	// Enqueue a new backup
	const { mutate: triggerBackup, isPending } = useMutation( {
		...siteBackupEnqueueMutation( site.ID ),
		onMutate: () => {
			setEnqueued( true );
		},
	} );

	// Lets fetch backups if we just enqueued a backup or if there's a backup running
	useQuery( {
		...siteBackupsQuery( site.ID ),
		refetchInterval: isRunning || isEnqueued ? 2000 : false,
	} );

	const handleClick = () => {
		recordTracksEvent( 'calypso_dashboard_backups_backup_now' );
		triggerBackup();
	};

	const isDisabled = isRunning || isPending || isEnqueued;

	return (
		<Button
			variant="secondary"
			onClick={ handleClick }
			disabled={ isDisabled }
			accessibleWhenDisabled
		>
			{ __( 'Back up now' ) }
		</Button>
	);
}
