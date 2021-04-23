/**
 * External dependencies
 */
import { find, map, partition, reduce, some } from 'lodash';
import React, { Fragment } from 'react';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import { getPlanTermLabel, isGoogleWorkspace, isTitanMail } from '@automattic/calypso-products';

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

function renderTransactionQuantitySummaryForTitanMail(
	licensed_quantity,
	new_quantity,
	isRenewal,
	isUpgrade,
	translate
) {
	if ( isRenewal ) {
		return translate( 'Renewal for %(quantity)d mailbox', 'Renewal for %(quantity)d mailboxes', {
			args: { quantity: licensed_quantity },
			count: licensed_quantity,
			comment: '%(quantity)d is number of mailboxes renewed',
		} );
	}

	if ( isUpgrade ) {
		return translate(
			'Purchase of %(quantity)d additional mailbox',
			'Purchase of %(quantity)d additional mailboxes',
			{
				args: { quantity: new_quantity },
				count: new_quantity,
				comment: '%(quantity)d is additional number of mailboxes purchased',
			}
		);
	}

	return translate( 'Purchase of %(quantity)d mailbox', 'Purchase of %(quantity)d mailboxes', {
		args: { quantity: licensed_quantity },
		count: licensed_quantity,
		comment: '%(quantity)d is number of mailboxes purchased',
	} );
}

function renderTransactionQuantitySummaryForGoogleWorkspace(
	licensed_quantity,
	new_quantity,
	isRenewal,
	isUpgrade,
	translate
) {
	if ( isRenewal ) {
		return translate( 'Renewal for %(quantity)d user', 'Renewal for %(quantity)d users', {
			args: { quantity: licensed_quantity },
			count: licensed_quantity,
			comment: '%(quantity)d is number of users renewed',
		} );
	}

	if ( isUpgrade ) {
		return translate(
			'Purchase of %(quantity)d additional user',
			'Purchase of %(quantity)d additional users',
			{
				args: { quantity: new_quantity },
				count: new_quantity,
				comment: '%(quantity)d is additional number of users purchased',
			}
		);
	}

	return translate( 'Purchase of %(quantity)d user', 'Purchase of %(quantity)d users', {
		args: { quantity: licensed_quantity },
		count: licensed_quantity,
		comment: '%(quantity)d is number of users purchased',
	} );
}

export function renderTransactionQuantitySummary(
	{ licensed_quantity, new_quantity, type, wpcom_product_slug },
	translate
) {
	if ( ! licensed_quantity ) {
		return null;
	}

	licensed_quantity = parseInt( licensed_quantity );
	new_quantity = parseInt( new_quantity );
	const product = { product_slug: wpcom_product_slug };
	const isRenewal = 'recurring' === type;
	const isUpgrade = 'new purchase' === type && new_quantity > 0;

	if ( isTitanMail( product ) ) {
		return renderTransactionQuantitySummaryForTitanMail(
			licensed_quantity,
			new_quantity,
			isRenewal,
			isUpgrade,
			translate
		);
	} else if ( isGoogleWorkspace( product ) ) {
		return renderTransactionQuantitySummaryForGoogleWorkspace(
			licensed_quantity,
			new_quantity,
			isRenewal,
			isUpgrade,
			translate
		);
	}
	if ( isRenewal ) {
		return translate( 'Renewal for %(quantity)d item', 'Renewal for %(quantity)d items', {
			args: { quantity: licensed_quantity },
			count: licensed_quantity,
			comment: '%(quantity)d is number of items renewed',
		} );
	}

	if ( isUpgrade ) {
		return translate(
			'Purchase of %(quantity)d additional item',
			'Purchase of %(quantity)d additional items',
			{
				args: { quantity: new_quantity },
				count: new_quantity,
				comment: '%(quantity)d is additional number of items purchased',
			}
		);
	}

	return translate( 'Purchase of %(quantity)d item', 'Purchase of %(quantity)d items', {
		args: { quantity: licensed_quantity },
		count: licensed_quantity,
		comment: '%(quantity)d is number of items purchased',
	} );
}

export function getTransactionTermLabel( transaction, translate ) {
	switch ( transaction.months_per_renewal_interval ) {
		case 1:
			return translate( 'Monthly subscription' );
		case 12:
			return translate( 'Annual subscription' );
		case 24:
			return translate( 'Two year subscription' );
		default:
			return getPlanTermLabel( transaction.wpcom_product_slug, translate );
	}
}
