/**
 * External dependencies
 */
import { find, map, partition, reduce, some } from 'lodash';
import React, { Fragment } from 'react';
import formatCurrency from '@automattic/format-currency';

export const groupDomainProducts = ( originalItems, translate ) => {
	const transactionItems = Object.keys( originalItems ).map( ( key ) => {
		return Object.assign( {}, originalItems[ key ] );
	} );
	const [ domainProducts, otherProducts ] = partition( transactionItems, {
		product_slug: 'wp-domains',
	} );

	const groupedDomainProducts = reduce(
		domainProducts,
		( groups, product ) => {
			// eslint-disable-next-line no-extra-boolean-cast
			if ( !! groups[ product.domain ] ) {
				groups[ product.domain ].raw_amount += product.raw_amount;
				groups[ product.domain ].groupCount++;
			} else {
				groups[ product.domain ] = product;
				groups[ product.domain ].groupCount = 1;
			}

			return groups;
		},
		{}
	);

	return [
		...otherProducts,
		...map( groupedDomainProducts, ( product ) => {
			if ( 1 === product.groupCount ) {
				return find( domainProducts, { domain: product.domain } );
			}
			return {
				...product,
				amount: formatCurrency( product.raw_amount, product.currency ),
				variation: translate( 'Domain Registration' ),
			};
		} ),
	];
};

export function transactionIncludesTax( transaction ) {
	if ( ! transaction || ! transaction.tax ) {
		return false;
	}

	// Consider the whole transaction to include tax if any item does
	return some( transaction.items, 'raw_tax' );
}

export function renderTransactionAmount( transaction, { translate, addingTax = false } ) {
	if ( ! transactionIncludesTax( transaction ) ) {
		return transaction.amount;
	}

	const taxAmount = addingTax
		? translate( '(+%(taxAmount)s tax)', {
				args: { taxAmount: transaction.tax },
				comment: 'taxAmount is a localized price, like $12.34',
		  } )
		: translate( '(includes %(taxAmount)s tax)', {
				args: { taxAmount: transaction.tax },
				comment: 'taxAmount is a localized price, like $12.34',
		  } );

	return (
		<Fragment>
			<div>{ transaction.amount }</div>
			<div className="billing-history__transaction-tax-amount">{ taxAmount }</div>
		</Fragment>
	);
}
