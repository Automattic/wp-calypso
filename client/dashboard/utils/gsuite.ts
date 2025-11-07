import { GoogleWorkspaceSlugs } from '@automattic/api-core';
import type { Domain } from '@automattic/api-core';

/**
 * Determines whether the specified product slug is for G Suite Basic or Business.
 * @param {string} productSlug - slug of the product
 * @returns {boolean} true if the slug refers to G Suite Basic or Business, false otherwise
 */
export function isGSuiteProductSlug( productSlug: string ): boolean {
	return (
		[
			GoogleWorkspaceSlugs.GSUITE_BASIC_SLUG,
			GoogleWorkspaceSlugs.GSUITE_BUSINESS_SLUG,
		] as readonly string[]
	 ).includes( productSlug );
}

/**
 * We'll use the following constants to do the switchover from
 * G Suite -> Google Workspace.
 * The product name is never translated in the translation strings
 * so we won't translate them here either.
 */
const GSUITE_PRODUCT_FAMILY = 'G Suite';
const GOOGLE_WORKSPACE_PRODUCT_FAMILY = 'Google Workspace';

export function getGoogleMailServiceFamily( productSlug: string ): string {
	if ( isGSuiteProductSlug( productSlug ) ) {
		return GSUITE_PRODUCT_FAMILY;
	}

	return GOOGLE_WORKSPACE_PRODUCT_FAMILY;
}

/**
 * Gets Google Workspace subscription status for a given domain object.
 * @returns {string} - Subscription status or empty string for null/undefined values
 */
export function getGSuiteSubscriptionStatus( domain: Domain | undefined ): string {
	return domain?.google_apps_subscription?.status ?? '';
}
