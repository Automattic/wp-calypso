/**
 * Internal dependencies
 */
import { isDomainMapping } from './is-domain-mapping';
import { isDomainRegistration } from './is-domain-registration';

export function isDomainProduct( product ) {
	return isDomainMapping( product ) || isDomainRegistration( product );
}
