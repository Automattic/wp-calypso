/**
 * Internal dependencies
 */
import {
	License,
	LicenseCounts,
	PaginatedItems,
	PartnerPortalStore,
} from 'calypso/state/partner-portal/types';
// Required for modular state.
import 'calypso/state/partner-portal/init';

export function hasFetchedLicenses( state: PartnerPortalStore ): boolean {
	return state.partnerPortal.licenses.hasFetched;
}

export function isFetchingLicenses( state: PartnerPortalStore ): boolean {
	return state.partnerPortal.licenses.isFetching;
}

export function getPaginatedLicenses(
	state: PartnerPortalStore
): PaginatedItems< License > | null {
	return state.partnerPortal.licenses.paginated;
}

export function getLicenseCounts( state: PartnerPortalStore ): LicenseCounts {
	return state.partnerPortal.licenses.counts;
}
