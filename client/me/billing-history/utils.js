/** @format */
/**
 * External dependencies
 */
import { map, partition, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import formatCurrency from 'lib/format-currency';

export const groupDomainProducts = ( transactionItems, translate ) => {
	const [ domainProducts, otherProducts ] = partition( transactionItems, { product: 'Domain' } );

	const groupedDomainProducts = reduce(
		domainProducts,
		( groups, product ) => {
			if ( !! groups[ product.domain ] ) {
				groups[ product.domain ].raw_amount += product.raw_amount;
			} else {
				groups[ product.domain ] = product;
			}
			return groups;
		},
		{}
	);

	return [
		...otherProducts,
		...map( groupedDomainProducts, product => ( {
			...product,
			amount: formatCurrency( product.raw_amount, product.currency ),
			variation: translate( 'Domain Registration' ),
		} ) ),
	];
};
