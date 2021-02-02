/**
 * Internal dependencies
 */
import {
	isGoogleWorkspaceProductSlug,
	isGSuiteProductSlug,
	isGSuiteOrExtraLicenseProductSlug,
	isGSuiteOrGoogleWorkspaceProductSlug,
} from 'calypso/lib/gsuite';
import { assertValidProduct } from 'calypso/lib/products-values/utils/assert-valid-product';
import { formatProduct } from 'calypso/lib/products-values/format-product';

export function isGoogleWorkspace( product ) {
	product = formatProduct( product );
	assertValidProduct( product );

	return isGoogleWorkspaceProductSlug( product.product_slug );
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
