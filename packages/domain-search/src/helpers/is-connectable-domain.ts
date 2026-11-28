import { DomainAvailabilityStatus, type DomainAvailability } from '@automattic/api-core';

export function isConnectableDomain(
	availability: Pick< DomainAvailability, 'status' | 'mappable' >
): boolean {
	return (
		availability.mappable === DomainAvailabilityStatus.MAPPABLE &&
		availability.status !== DomainAvailabilityStatus.PENDING_DELETE_NOT_TRANSFERRABLE
	);
}
