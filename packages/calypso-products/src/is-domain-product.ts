import { isDomainMapping } from './is-domain-mapping';
import { isDomainRegistration } from './is-domain-registration';
import type { WithSnakeCaseSlug, WithCamelCaseSlug } from './types';

export function isDomainProduct(
	product: ( WithSnakeCaseSlug | WithCamelCaseSlug ) & {
		is_domain_registration?: boolean;
		isDomainRegistration?: boolean;
	}
): boolean {
	return isDomainMapping( product ) || isDomainRegistration( product );
}
