import { camelOrSnakeSlug } from './camel-or-snake-slug';
import {
	isGoogleWorkspaceProductSlug,
	isGSuiteOrExtraLicenseProductSlug,
} from './gsuite-product-slug';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isGSuiteOrExtraLicenseOrGoogleWorkspace(
	product: WithCamelCaseSlug | WithSnakeCaseSlug
): boolean {
	return (
		isGSuiteOrExtraLicenseProductSlug( camelOrSnakeSlug( product ) ) ||
		isGoogleWorkspaceProductSlug( camelOrSnakeSlug( product ) )
	);
}
