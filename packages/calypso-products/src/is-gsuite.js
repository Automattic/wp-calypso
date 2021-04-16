/**
 * Internal dependencies
 */
import {
	isGoogleWorkspaceProductSlug,
	isGSuiteProductSlug,
	isGSuiteOrExtraLicenseProductSlug,
	isGSuiteOrGoogleWorkspaceProductSlug,
} from 'calypso/lib/gsuite';
import { assertValidProduct } from './utils/assert-valid-product';
import { formatProduct } from './format-product';

export function isGoogleWorkspace( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isGoogleWorkspaceProductSlug( product.product_slug );
}

/**
 * Determines whether the provided Google Workspace product is for a user purchasing extra licenses (versus a new account).
 *
 * @param {object} product - product object
 * @returns {boolean} - true if this product is for extra licenses, false otherwise
 * @see isGoogleWorkspaceExtraLicence() in client/lib/purchases for a function that works on a purchase object
 */
export function isGoogleWorkspaceExtraLicence( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	if ( ! isGoogleWorkspaceProductSlug( product.product_slug ) ) {
		return false;
	}

	// Checks if the 'new_quantity' property exists as it should only be specified for extra licenses
	return product?.extra?.new_quantity !== undefined;
}

export function isGSuite( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isGSuiteProductSlug( product.product_slug );
}

export function isGSuiteOrExtraLicense( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isGSuiteOrExtraLicenseProductSlug( product.product_slug );
}

export function isGSuiteOrExtraLicenseOrGoogleWorkspace( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return (
		isGSuiteOrExtraLicenseProductSlug( product.product_slug ) ||
		isGoogleWorkspaceProductSlug( product.product_slug )
	);
}

export function isGSuiteOrGoogleWorkspace( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isGSuiteOrGoogleWorkspaceProductSlug( product.product_slug );
}
