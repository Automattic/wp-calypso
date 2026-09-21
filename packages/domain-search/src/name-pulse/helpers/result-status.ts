import { NamePulseDomainStatus, type NamePulseDomainUpdate } from './types';

/**
 * UNKNOWN is what a failed or timed-out batch leaves behind, so it is retried
 * rather than treated as final.
 */
export const needsAvailabilityCheck = ( status: NamePulseDomainStatus ) =>
	status === NamePulseDomainStatus.WAITING || status === NamePulseDomainStatus.UNKNOWN;

/**
 * A real-time verdict is never overwritten by a bulk zone-file one, and UNKNOWN
 * only lands on rows still WAITING, so a late timer never erases a verdict.
 * Works for a row as well as for a stored verdict.
 */
export const mergeResultUpdate = < T extends NamePulseDomainUpdate >(
	existing: T,
	update: NamePulseDomainUpdate
): T => {
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
