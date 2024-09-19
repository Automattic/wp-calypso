import { isGoogleWorkspaceProductSlug } from './is-google-workspace-product-slug';
import { isGSuiteProductSlug } from './is-gsuite-product-slug';

/**
 * Determines whether the specified product slug refers to either G Suite or Google Workspace.
 * @param {string} productSlug - slug of the product
 * @returns {boolean} true if the slug refers to G Suite or Google Workspace, false otherwise
 */
export function isGSuiteOrGoogleWorkspaceProductSlug( productSlug: string ): boolean {
	return isGSuiteProductSlug( productSlug ) || isGoogleWorkspaceProductSlug( productSlug );
}
