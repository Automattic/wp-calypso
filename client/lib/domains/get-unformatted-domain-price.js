/**
 * External dependencies
 */
import { get } from 'lodash';

export function getUnformattedDomainPrice( slug, productsList ) {
	let price = get( productsList, [ slug, 'cost' ], null );

	if ( price ) {
		price += get( productsList, [ 'domain_map', 'cost' ], 0 );
	}

	return price;
}
