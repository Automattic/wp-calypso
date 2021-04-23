/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';

export function getDomain( product ) {
	product = snakeCase( product );

	const domainToBundle = product.extra?.domain_to_bundle;
	if ( domainToBundle ) {
		return domainToBundle;
	}

	return product.meta;
}
