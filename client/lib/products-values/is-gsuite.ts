/**
 * Internal dependencies
 */
import {
	isGoogleWorkspaceProductSlug,
	isGSuiteProductSlug,
	isGSuiteOrExtraLicenseProductSlug,
	isGSuiteOrGoogleWorkspaceProductSlug,
} from 'calypso/lib/gsuite';
import { formatProduct } from 'calypso/lib/products-values/format-product';
import type { FormattedProduct, CamelCaseProduct } from './types';

export function isGoogleWorkspace( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return isGoogleWorkspaceProductSlug( product.product_slug );
}

/**
 * Determines whether the provided Google Workspace product is for a user purchasing extra licenses (versus a new account).
 *
 * @param {object} product - product object
 * @returns {boolean} - true if this product is for extra licenses, false otherwise
 * @see isGoogleWorkspaceExtraLicence() in client/lib/purchases for a function that works on a purchase object
 */
export function isGoogleWorkspaceExtraLicence(
	product: FormattedProduct | CamelCaseProduct
): boolean {
	product = formatProduct( product );
	if ( ! isGoogleWorkspaceProductSlug( product.product_slug ) ) {
		return false;
	}

	// Checks if the 'new_quantity' property exists as it should only be specified for extra licenses
	return product?.extra?.new_quantity !== undefined;
}

export function isGSuite( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return isGSuiteProductSlug( product.product_slug );
}

export function isGSuiteOrExtraLicense( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return isGSuiteOrExtraLicenseProductSlug( product.product_slug );
}

export function isGSuiteOrExtraLicenseOrGoogleWorkspace(
	product: FormattedProduct | CamelCaseProduct
): boolean {
	product = formatProduct( product );
	return (
		isGSuiteOrExtraLicenseProductSlug( product.product_slug ) ||
		isGoogleWorkspaceProductSlug( product.product_slug )
	);
}

export function isGSuiteOrGoogleWorkspace( product: FormattedProduct | CamelCaseProduct ): boolean {
	product = formatProduct( product );
	return isGSuiteOrGoogleWorkspaceProductSlug( product.product_slug );
}
