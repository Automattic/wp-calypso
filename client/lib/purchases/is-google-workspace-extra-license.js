/**
 * Internal Dependencies
 */
import { isGoogleWorkspaceProductSlug } from 'calypso/lib/gsuite';

/**
 * Determines whether the provided Google Workspace purchase is for a user purchasing extra licenses (versus a new account).
 *
 * @param {object} purchase - purchase object
 * @returns {boolean} - true if this purchase is for extra licenses, false otherwise
 * @see isGoogleWorkspaceExtraLicence() in client/lib/product-values for a function that works on a product object
 */
export function isGoogleWorkspaceExtraLicence( purchase ) {
	if ( ! isGoogleWorkspaceProductSlug( purchase.productSlug ) ) {
		return false;
	}

	// Checks if the 'newQuantity' property exists as it should only be specified for extra licenses
	return purchase?.newQuantity !== undefined;
}
