/**
 * Internal dependencies
 */
import { snakeCase } from './snake-case';
import { isDomainRegistration } from './is-domain-registration';
import { isDomainMapping } from './is-domain-mapping';

export function getDomainProductRanking( product ) {
	product = snakeCase( product );

	if ( isDomainRegistration( product ) ) {
		return 0;
	} else if ( isDomainMapping( product ) ) {
		return 1;
	}
}
