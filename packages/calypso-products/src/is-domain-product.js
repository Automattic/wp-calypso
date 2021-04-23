/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';
import { isDomainMapping } from './is-domain-mapping';
import { isDomainRegistration } from './is-domain-registration';

export function isDomainProduct( product ) {
	product = snakeCase( product );

	return isDomainMapping( product ) || isDomainRegistration( product );
}
