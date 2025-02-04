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

/**
 * Returns the product IDs of the assigned plan (bundle) & all the products to a particular site in an array.
 * @param state
 * @param siteId
 * @returns {Array} An array of products and plan IDs.
 */
export function getAssignedPlanAndProductIDsForSite(
	state: AppState,
	siteId: number
): Array< number > {
	const planAndProductIDs: number[] = [];
	const currentSite = state?.sites?.items?.[ siteId ];
	// Get the assigned plan(bundle) to a site.
	const plan = currentSite?.plan.product_id;
	if ( plan ) {
		planAndProductIDs.push( plan );
	}
	// Get all assigned products to a site.
	currentSite?.products.forEach( ( product: { product_id: string } ) =>
		planAndProductIDs.push( parseInt( product.product_id ) )
	);
	return planAndProductIDs;
}

/**
 * Returns if the site has purchased standalone product licenses (not bundles) for the given site ID.
 * @param state
 * @param siteId
 * @returns {boolean} True if the site has standalone products only.
 */
export function hasPurchasedProductsOnly( state: AppState, siteId: number ): Array< number > {
	const currentSite = state?.sites?.items?.[ siteId ];

	return currentSite?.products?.length && currentSite?.plan?.is_free;
}
