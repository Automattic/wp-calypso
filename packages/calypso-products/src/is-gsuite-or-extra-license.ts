import { camelOrSnakeSlug } from './camel-or-snake-slug';
import { isGSuiteOrExtraLicenseProductSlug } from './gsuite-product-slug';
import type { WithCamelCaseSlug, WithSnakeCaseSlug } from './types';

export function isGSuiteOrExtraLicense( product: WithCamelCaseSlug | WithSnakeCaseSlug ): boolean {
	return isGSuiteOrExtraLicenseProductSlug( camelOrSnakeSlug( product ) );
}
