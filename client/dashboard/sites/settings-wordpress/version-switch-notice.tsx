import { __, sprintf } from '@wordpress/i18n';
import { Notice } from '../../components/notice';
import type { BackupState } from '../backups/use-backup-state';

interface VersionSwitchNoticeProps {
	backupState: BackupState;
	targetVersion: string;
	// Owners who can't restore the backup a switch takes aren't told about it.
	canRestoreBackup: boolean;
	switchingToBeta: boolean;
}

function getMessage(
	{ status, backup }: BackupState,
	canRestoreBackup: boolean
): string | undefined {
	switch ( status ) {
		case 'enqueued':
			return canRestoreBackup ? __( 'Backing up your site.' ) : __( 'Getting your site ready.' );
		case 'running':
			return canRestoreBackup
				? sprintf(
						// translators: %s: backup progress percentage
						__( 'Backing up your site… (%s%% progress). This may take a few minutes.' ),
						backup?.percent ?? '0'
					)
				: sprintf(
						// translators: %s: progress percentage
						__( 'Getting your site ready… (%s%% progress). This may take a few minutes.' ),
						backup?.percent ?? '0'
					);
		case 'success':
			return canRestoreBackup
				? __( 'Backup complete. Switching versions now.' )
				: __( 'Switching versions now.' );
		case 'error':
			return undefined;
		default:
			// Idle: a pending version exists but the backup hasn't started yet.
			return __( 'Starting version switch.' );
	}
}

export function VersionSwitchNotice( {
	backupState,
	targetVersion,
	canRestoreBackup,
	switchingToBeta,
}: VersionSwitchNoticeProps ) {
	if ( backupState.status === 'error' ) {
		return (
			<Notice variant="error" title={ __( 'Version switch failed' ) }>
				{ canRestoreBackup
					? __( 'The backup could not be completed. Please try again or contact support.' )
					: __(
							'Your site couldn’t be prepared for the switch. Please try again or contact support.'
						) }
			</Notice>
		);
	}

	const healthCheck = switchingToBeta
		? __(
				'Once it’s switched, we’ll check that your site still loads and move it back to the stable release if it doesn’t.'
			)
		: '';

	return (
		<Notice
			variant="info"
			title={ sprintf(
				// translators: %s: WordPress version, e.g. "7.0-RC2"
				__( 'Switching to WordPress %s' ),
				targetVersion
			) }
		>
			{ [ getMessage( backupState, canRestoreBackup ), healthCheck ].filter( Boolean ).join( ' ' ) }
		</Notice>
	);
}
