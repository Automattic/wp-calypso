import { camelOrSnakeSlug } from './camel-or-snake-slug';
import {
	isGoogleWorkspaceProductSlug,
	isGSuiteProductSlug,
	isGSuiteOrExtraLicenseProductSlug,
	isGSuiteOrGoogleWorkspaceProductSlug,
} from './gsuite-product-slug';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isGoogleWorkspace( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return isGoogleWorkspaceProductSlug( camelOrSnakeSlug( product ) );
}

/**
 * Determines whether the provided Google Workspace product is for a user purchasing extra licenses (versus a new account).
 *
 * @see isGoogleWorkspaceExtraLicence() in client/lib/purchases for a function that works on a purchase object
 */
export function isGoogleWorkspaceExtraLicence(
	product: ( WithCamelCaseSlug | WithSnakeCaseSlug ) & { extra?: { new_quantity?: number } }
): boolean {
	if ( ! isGoogleWorkspaceProductSlug( camelOrSnakeSlug( product ) ) ) {
		return false;
	}

	// Checks if the 'new_quantity' property exists as it should only be specified for extra licenses
	return product?.extra?.new_quantity !== undefined;
}

export function isGSuite( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return isGSuiteProductSlug( camelOrSnakeSlug( product ) );
}

export function isGSuiteOrExtraLicense( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return isGSuiteOrExtraLicenseProductSlug( camelOrSnakeSlug( product ) );
}

export function isGSuiteOrExtraLicenseOrGoogleWorkspace(
	product: WithCamelCaseSlug | WithSnakeCaseSlug
): boolean {
	return (
		isGSuiteOrExtraLicenseProductSlug( camelOrSnakeSlug( product ) ) ||
		isGoogleWorkspaceProductSlug( camelOrSnakeSlug( product ) )
	);
}

export function isGSuiteOrGoogleWorkspace(
	product: WithCamelCaseSlug | WithSnakeCaseSlug
): boolean {
	return isGSuiteOrGoogleWorkspaceProductSlug( camelOrSnakeSlug( product ) );
}
