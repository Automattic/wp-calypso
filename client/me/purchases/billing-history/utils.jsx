/**
 * External dependencies
 */
import { find, map, partition, reduce, some } from 'lodash';
import React, { Fragment } from 'react';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import { getPlanTermLabel } from 'calypso/lib/plans';
import { isGoogleWorkspace, isTitanMail } from 'calypso/lib/products-values';

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
		return translate( 'Renewal for %(quantity)s mailbox', 'Renewal for %(quantity)s mailboxes', {
			args: { quantity: licensed_quantity },
			count: licensed_quantity,
			context: 'Renewal description with number of mailboxes renewed',
			comment: '%(quantity)s is number of mailboxes renewed',
		} );
	}

	if ( isUpgrade ) {
		return translate(
			'Purchase of %(quantity)s new mailbox',
			'Purchase of %(quantity)s new mailboxes',
			{
				args: { quantity: new_quantity },
				count: new_quantity,
				context: 'Purchase description with additional number of mailboxes purchased',
				comment: '%(quantity)s is additional number of mailboxes purchased',
			}
		);
	}

	return translate( 'Purchase of %(quantity)s mailbox', 'Purchase of %(quantity)s mailboxes', {
		args: { quantity: licensed_quantity },
		count: licensed_quantity,
		context: 'Purchase description with number of mailboxes purchased',
		comment: '%(quantity)s is number of mailboxes purchased',
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
		return translate( 'Renewal for %(quantity)s user', 'Renewal for %(quantity)s users', {
			args: { quantity: licensed_quantity },
			count: licensed_quantity,
			context: 'Renewal description with number of users renewed',
			comment: '%(quantity)s is number of users renewed',
		} );
	}

	if ( isUpgrade ) {
		return translate( 'Purchase of %(quantity)s new user', 'Purchase of %(quantity)s new users', {
			args: { quantity: new_quantity },
			count: new_quantity,
			context: 'Purchase description with additional number of users purchased',
			comment: '%(quantity)s is additional number of users purchased',
		} );
	}

	return translate( 'Purchase of %(quantity)s user', 'Purchase of %(quantity)s users', {
		args: { quantity: licensed_quantity },
		count: licensed_quantity,
		context: 'Purchase description with number of users purchased',
		comment: '%(quantity)s is number of users purchased',
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
		return translate( 'Renewal for %(quantity)s item', 'Renewal for %(quantity)s items', {
			args: { quantity: licensed_quantity },
			count: licensed_quantity,
			context: 'Renewal description with number of items renewed',
			comment: '%(quantity)s is number of items renewed',
		} );
	}

	if ( isUpgrade ) {
		return translate( 'Purchase of %(quantity)s new item', 'Purchase of %(quantity)s new items', {
			args: { quantity: new_quantity },
			count: new_quantity,
			context: 'Purchase description with additional number of items purchased',
			comment: '%(quantity)s is additional number of items purchased',
		} );
	}

	return translate( 'Purchase of %(quantity)s item', 'Purchase of %(quantity)s items', {
		args: { quantity: licensed_quantity },
		count: licensed_quantity,
		context: 'Purchase description with number of items purchased',
		comment: '%(quantity)s is number of items purchased',
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
