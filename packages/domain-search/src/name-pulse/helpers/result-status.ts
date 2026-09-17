import { DomainAvailabilityStatus } from '@automattic/api-core';
import { pickPricing } from './pricing';
import {
	NamePulseDomainStatus,
	type NamePulseDomainResult,
	type NamePulseDomainUpdate,
} from './types';
import type { DomainAvailability } from '@automattic/api-core';

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

export const isAvailableStatus = ( status: DomainAvailabilityStatus ) =>
	status === DomainAvailabilityStatus.AVAILABLE ||
	status === DomainAvailabilityStatus.AVAILABLE_PREMIUM;

export const toRealtimeUpdate = (
	domainName: string,
	availability: DomainAvailability
): NamePulseDomainUpdate => {
	const available = isAvailableStatus( availability.status );

	return {
		domain_name: domainName,
		status: available ? NamePulseDomainStatus.AVAILABLE : NamePulseDomainStatus.TAKEN,
		...pickPricing( availability ),
		cost: available ? availability.cost : undefined,
		is_premium: availability.status === DomainAvailabilityStatus.AVAILABLE_PREMIUM,
		is_realtime: true,
	};
};
