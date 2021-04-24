/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';

export function isDomainRegistration( product ) {
	product = snakeCase( product );
	return !! product.is_domain_registration;
}
