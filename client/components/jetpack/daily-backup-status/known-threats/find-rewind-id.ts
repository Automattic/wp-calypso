import { SUCCESSFUL_BACKUP_ACTIVITIES } from 'calypso/lib/jetpack/backup-utils';

interface RewindableActivity {
	rewindId?: string;
	activityIsRewindable?: boolean;
	activityName?: string;
}

/**
 * The earliest known backup period after `period`, if any. Anything at or after it belongs to a
 * later backup.
 */
export function getNextBackupPeriod( period: number, knownPeriods: number[] = [] ): number | null {
	let next: number | null = null;
	for ( const candidate of knownPeriods ) {
		if ( candidate > period && ( next === null || candidate < next ) ) {
			next = candidate;
		}
	}
	return next;
}

/**
 * Activity Log "backup complete" activities carry their own rewind id, which is slightly later than
 * (and has a fractional part the bare VaultPress backup period lacks). Resolve a backup period to
 * the earliest successful-backup activity that belongs to it: at or after the period, and before the
 * next known backup period (a rewind id belongs to the largest backup period <= floor( rewindId )).
 * Returns null rather than a rewind id that could restore a different backup.
 */
export function findRewindIdForBackupPeriod(
	activities: RewindableActivity[] | undefined,
	period: number,
	knownPeriods: number[] = []
): string | null {
	const nextPeriod = getNextBackupPeriod( period, knownPeriods );
	let best: { rewindId: string; value: number } | null = null;

	for ( const { rewindId, activityIsRewindable, activityName } of activities ?? [] ) {
		if (
			! rewindId ||
			! activityIsRewindable ||
			! activityName ||
			! SUCCESSFUL_BACKUP_ACTIVITIES.includes( activityName )
		) {
			continue;
		}
		const value = Number( rewindId );
		if ( ! Number.isFinite( value ) ) {
			continue;
		}
		const floor = Math.floor( value );
		if ( floor < period || ( nextPeriod !== null && floor >= nextPeriod ) ) {
			continue;
		}
		if ( ! best || value < best.value ) {
			best = { rewindId, value };
		}
	}

	return best?.rewindId ?? null;
}
