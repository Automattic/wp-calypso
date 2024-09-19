import { GSUITE_BASIC_SLUG, GSUITE_BUSINESS_SLUG } from './constants';

/**
 * Determines whether the specified product slug is for G Suite Basic or Business.
 * @param {string} productSlug - slug of the product
 * @returns {boolean} true if the slug refers to G Suite Basic or Business, false otherwise
 */
export function isGSuiteProductSlug( productSlug: string ): boolean {
	return [ GSUITE_BASIC_SLUG, GSUITE_BUSINESS_SLUG ].includes( productSlug );
}
