import { GSUITE_EXTRA_LICENSE_SLUG } from './constants';

/**
 * Determines whether the specified product slug is for a G Suite extra license.
 * @param {string} productSlug - slug of the product
 * @returns {boolean} true if the slug refers to an extra license, false otherwise
 */
export function isGSuiteExtraLicenseProductSlug( productSlug: string ): boolean {
	return productSlug === GSUITE_EXTRA_LICENSE_SLUG;
}
