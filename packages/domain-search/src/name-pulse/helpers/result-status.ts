import {
	NamePulseDomainStatus,
	type NamePulseDomainResult,
	type NamePulseDomainUpdate,
} from './types';

/**
 * UNKNOWN is what a failed or timed-out batch leaves behind, so it is retried
 * rather than treated as final.
 */
export const needsAvailabilityCheck = ( status: NamePulseDomainStatus ) =>
	status === NamePulseDomainStatus.WAITING || status === NamePulseDomainStatus.UNKNOWN;

/**
 * A real-time verdict is never overwritten by a bulk zone-file one, and UNKNOWN
 * only lands on rows still WAITING, so a late timer never erases a verdict.
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
