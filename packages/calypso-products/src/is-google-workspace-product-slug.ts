import {
	GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY,
	GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
} from './constants';

/**
 * Determines whether the specified product slug is for Google Workspace Business Starter.
 * @param {string} productSlug - slug of the product
 * @returns {boolean} true if the slug refers to Google Workspace Business Starter, false otherwise
 */
export function isGoogleWorkspaceProductSlug( productSlug: string ): boolean {
	return [
		GOOGLE_WORKSPACE_BUSINESS_STARTER_MONTHLY,
		GOOGLE_WORKSPACE_BUSINESS_STARTER_YEARLY,
	].includes( productSlug );
}
