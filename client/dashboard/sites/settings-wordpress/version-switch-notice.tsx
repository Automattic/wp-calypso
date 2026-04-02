import { __, sprintf } from '@wordpress/i18n';
import { Notice } from '../../components/notice';
import type { BackupState } from '../backups/use-backup-state';

interface VersionSwitchNoticeProps {
	backupState: BackupState;
	targetVersion: string;
	isVersionSwitched: boolean;
}

export function VersionSwitchNotice( {
	backupState,
	targetVersion,
	isVersionSwitched,
}: VersionSwitchNoticeProps ) {
	const { status, backup } = backupState;

	if ( isVersionSwitched ) {
		return (
			<Notice variant="success" title={ __( 'WordPress version updated' ) }>
				{ sprintf(
					// translators: %s: WordPress version, e.g. "7.0-RC2"
					__( 'Your site is now running WordPress %s.' ),
					targetVersion
				) }
			</Notice>
		);
	}

	if ( status === 'enqueued' ) {
		return (
			<Notice
				variant="info"
				title={ sprintf(
					// translators: %s: WordPress version, e.g. "7.0-RC2"
					__( 'Switching to WordPress %s…' ),
					targetVersion
				) }
			>
				{ __( 'Creating a backup of your site before switching.' ) }
			</Notice>
		);
	}

	if ( status === 'running' ) {
		return (
			<Notice
				variant="info"
				title={ sprintf(
					// translators: %s: WordPress version, e.g. "7.0-RC2"
					__( 'Switching to WordPress %s…' ),
					targetVersion
				) }
			>
				{ sprintf(
					// translators: %s: backup progress percentage
					__(
						'Generating backup… (%s%% progress). A backup is being created before switching. This may take a few minutes.'
					),
					backup?.percent ?? '0'
				) }
			</Notice>
		);
	}

	if ( status === 'success' ) {
		return (
			<Notice
				variant="info"
				title={ sprintf(
					// translators: %s: WordPress version, e.g. "7.0-RC2"
					__( 'Switching to WordPress %s…' ),
					targetVersion
				) }
			>
				{ __( 'Backup completed. Now switching WordPress version…' ) }
			</Notice>
		);
	}

	if ( status === 'error' ) {
		return (
			<Notice variant="error" title={ __( 'Version switch failed' ) }>
				{ __( 'The backup could not be completed. Please try again or contact support.' ) }
			</Notice>
		);
	}

	return null;
}
