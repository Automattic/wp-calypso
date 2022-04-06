import { GSUITE_EXTRA_LICENSE_SLUG } from './constants';

/**
 * Determines whether the specified product slug is for a G Suite extra license.
 *
 * @param {string} productSlug - slug of the product
 * @returns {boolean} true if the slug refers to an extra license, false otherwise
 */
export function isGSuiteExtraLicenseProductSlug( productSlug: string ): boolean {
	return productSlug === GSUITE_EXTRA_LICENSE_SLUG;
}

/**
 * Determines whether the specified product slug refers to any type of G Suite product.
 *
 * @param {string} productSlug - slug of the product
 * @returns {boolean} true if the slug refers to any G Suite product, false otherwise
 */
export function isGSuiteOrExtraLicenseProductSlug( productSlug: string ): boolean {
	return isGSuiteProductSlug( productSlug ) || isGSuiteExtraLicenseProductSlug( productSlug );
}

/**
 * Determines whether the specified product slug refers to either G Suite or Google Workspace.
 *
 * @param {string} productSlug - slug of the product
 * @returns {boolean} true if the slug refers to G Suite or Google Workspace, false otherwise
 */
export function isGSuiteOrGoogleWorkspaceProductSlug( productSlug: string ): boolean {
	return isGSuiteProductSlug( productSlug ) || isGoogleWorkspaceProductSlug( productSlug );
}
