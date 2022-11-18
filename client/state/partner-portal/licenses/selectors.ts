import {
	License,
	LicenseCounts,
	PaginatedItems,
	PartnerPortalStore,
} from 'calypso/state/partner-portal/types';
// Required for modular state.
import 'calypso/state/partner-portal/init';
import type { AppState } from 'calypso/types';

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

export function hasFetchedLicenseCounts( state: PartnerPortalStore ): boolean {
	return state.partnerPortal.licenses.hasFetchedLicenseCounts;
}

// Returns the product IDs of the assigned plan(bundle) & all the products to a particular site in an array.
export function getAssignedPlanAndProductIDsForSite(
	state: AppState,
	siteId: number
): Array< number > {
	let planAndProductIDs: number[] = [];
	const currentSite = state?.sites?.items?.[ siteId ];
	// Get the assigned plan(bundle) to a site.
	const plan = currentSite?.plan.product_id;
	if ( plan ) {
		planAndProductIDs.push( plan );
	}
	// Get all assigned products to a site.
	const products = currentSite?.products.map( ( product: { product_id: string } ) =>
		// parseInt since the product IDs are strings of numbers.
		parseInt( product.product_id )
	);
	if ( products?.length ) {
		planAndProductIDs = [ ...planAndProductIDs, ...products ];
	}
	return planAndProductIDs;
}
