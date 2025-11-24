import { BackupProgressNotices } from './backup-progress-notices';
import { RestoreProgressNotices } from './restore-progress-notices';
import { useRewindState } from './use-rewind-state';
import type { BackupState } from './use-backup-state';
import type { Site } from '@automattic/api-core';

interface BackupNoticesProps {
	backupState: BackupState;
	site: Site;
	timezoneString?: string;
	gmtOffset?: number;
}

/**
 * Orchestrates display of backup and restore operation notices with priority ordering.
 *
 * Priority order (highest to lowest):
 * 1. Restore operations
 * 2. Backup operations
 *
 * Blocking rules:
 * - Restore blocks Backup (restore and backup cannot coexist)
 */
export function BackupNotices( {
	backupState,
	site,
	timezoneString,
	gmtOffset,
}: BackupNoticesProps ) {
	const { hasActiveRestore } = useRewindState( site.ID );

	return (
		<>
			{ /* Priority 1: Restore operations */ }
			<RestoreProgressNotices
				site={ site }
				timezoneString={ timezoneString }
				gmtOffset={ gmtOffset }
			/>

			{ /* Priority 2: Backup operations - blocked by active restore */ }
			{ ! hasActiveRestore && (
				<BackupProgressNotices
					backupState={ backupState }
					site={ site }
					timezoneString={ timezoneString }
					gmtOffset={ gmtOffset }
				/>
			) }
		</>
	);
}
