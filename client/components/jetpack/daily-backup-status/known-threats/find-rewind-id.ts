interface RewindableActivity {
	rewindId?: string;
	activityIsRewindable?: boolean;
}

/**
 * Activity Log "backup complete" activities carry their own rewind id, which is slightly later than
 * (and has a fractional part the bare VaultPress backup period lacks). Resolve a backup period to
 * the earliest rewindable activity at or after it.
 */
export function findRewindIdForBackupPeriod(
	activities: RewindableActivity[] | undefined,
	period: number
): string | null {
	let best: { rewindId: string; value: number } | null = null;

	for ( const { rewindId, activityIsRewindable } of activities ?? [] ) {
		if ( ! rewindId || ! activityIsRewindable ) {
			continue;
		}
		const value = Number( rewindId );
		if ( ! Number.isFinite( value ) || Math.floor( value ) < period ) {
			continue;
		}
		if ( ! best || value < best.value ) {
			best = { rewindId, value };
		}
	}

	return best?.rewindId ?? null;
}
