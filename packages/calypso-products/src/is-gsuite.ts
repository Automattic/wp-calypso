import { camelOrSnakeSlug } from './camel-or-snake-slug';
import {
	isGoogleWorkspaceProductSlug,
	isGSuiteProductSlug,
	isGSuiteOrGoogleWorkspaceProductSlug,
} from './gsuite-product-slug';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isGoogleWorkspace( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return isGoogleWorkspaceProductSlug( camelOrSnakeSlug( product ) );
}

/**
 * Determines whether the provided Google Workspace product is for a user purchasing extra licenses (versus a new account).
 */
export function isGoogleWorkspaceExtraLicence(
	product: ( WithCamelCaseSlug | WithSnakeCaseSlug ) & {
		newQuantity?: number;
		extra?: { new_quantity?: number };
	}
): boolean {
	if ( ! isGoogleWorkspaceProductSlug( camelOrSnakeSlug( product ) ) ) {
		return false;
	}

	// Checks if the 'new_quantity' property exists as it should only be specified for extra licenses
	return product?.extra?.new_quantity !== undefined || product?.newQuantity !== undefined;
}

export function isGSuite( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return isGSuiteProductSlug( camelOrSnakeSlug( product ) );
}

export function isGSuiteOrGoogleWorkspace(
	product: WithCamelCaseSlug | WithSnakeCaseSlug
): boolean {
	return isGSuiteOrGoogleWorkspaceProductSlug( camelOrSnakeSlug( product ) );
}
