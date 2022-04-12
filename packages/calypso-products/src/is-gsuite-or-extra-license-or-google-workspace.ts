import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { isGoogleWorkspaceProductSlug } from './is-google-workspace-product-slug';
import { isGSuiteOrExtraLicenseProductSlug } from './is-gsuite-or-extra-license-product-slug';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isGSuiteOrExtraLicenseOrGoogleWorkspace(
	product: WithCamelCaseSlug | WithSnakeCaseSlug
): boolean {
	return (
		isGSuiteOrExtraLicenseProductSlug( camelOrSnakeSlug( product ) ) ||
		isGoogleWorkspaceProductSlug( camelOrSnakeSlug( product ) )
	);
}
