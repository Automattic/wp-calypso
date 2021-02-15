/**
 * Internal dependencies
 */
import { License, PaginatedItems, PartnerPortalStore } from 'calypso/state/partner-portal';
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
