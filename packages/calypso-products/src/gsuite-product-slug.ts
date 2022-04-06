import { isGoogleWorkspaceProductSlug } from './is-google-workspace-product-slug';
import { isGSuiteExtraLicenseProductSlug } from './is-gsuite-extra-license-product-slug';
import { isGSuiteProductSlug } from './is-gsuite-product-slug';

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
