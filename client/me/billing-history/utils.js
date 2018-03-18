/** @format */
/**
 * External dependencies
 */
import { find, map, partition, reduce } from 'lodash';

/**
 * Internal dependencies
 */
import formatCurrency from 'lib/format-currency';

export const groupDomainProducts = ( transactionItems, translate ) => {
	const [ domainProducts, otherProducts ] = partition( transactionItems, {
		product_slug: 'wp-domains',
	} );

	const groupedDomainProducts = reduce(
		domainProducts,
		( groups, product ) => {
			if ( !! groups[ product.domain ] ) {
				groups[ product.domain ].raw_amount += product.raw_amount;
				groups[ product.domain ].groupCount++;
			} else {
				groups[ product.domain ] = product;
				groups[ product.domain ].groupCount = 1;
			}
			groups[ product.domain ].hasPrivateRegistration |=
				product.variation_slug === 'wp-private-registration';
			return groups;
		},
		{}
	);

	return [
		...otherProducts,
		...map( groupedDomainProducts, product => {
			if ( 1 === product.groupCount ) {
				return find( domainProducts, { domain: product.domain } );
			}
			return {
				...product,
				amount: formatCurrency( product.raw_amount, product.currency ),
				variation: product.hasPrivateRegistration
					? translate( 'Domain Registration with Privacy Protection' )
					: translate( 'Domain Registration' ),
			};
		} ),
	];
};
