import {
	NamePulseDomainStatus,
	type NamePulseDomainResult,
	type NamePulseDomainUpdate,
} from './types';

/**
 * Rows in these states have no verdict yet and are (re)requested on the next
 * search or "Show more". UNKNOWN is what a failed or timed-out batch leaves
 * behind, so it must be retried rather than treated as final.
 */
export const needsAvailabilityCheck = ( status: NamePulseDomainStatus ) =>
	status === NamePulseDomainStatus.WAITING || status === NamePulseDomainStatus.UNKNOWN;

/**
 * Merge one update into an existing row, or return the row unchanged when the
 * update must not apply:
 *
 * - a real-time (v1.3) verdict is never overwritten by a bulk zone-file one;
 * - UNKNOWN (batch failed / timed out) only lands on rows still WAITING, so a
 *   late timer never erases a verdict that arrived in the meantime.
 */
export const mergeResultUpdate = (
	existing: NamePulseDomainResult,
	update: NamePulseDomainUpdate
): NamePulseDomainResult => {
	if ( existing.is_realtime && ! update.is_realtime ) {
		return existing;
	}

	if (
		update.status === NamePulseDomainStatus.UNKNOWN &&
		existing.status !== NamePulseDomainStatus.WAITING
	) {
		return existing;
	}

	return { ...existing, ...update };
};
