import {
	getPlanTermLabel,
	isDIFMProduct,
	isGoogleWorkspace,
	isTitanMail,
} from '@automattic/calypso-products';
import formatCurrency from '@automattic/format-currency';
import { LocalizeProps, useTranslate } from 'i18n-calypso';
import { Fragment } from 'react';
import { useTaxName } from 'calypso/my-sites/checkout/src/hooks/use-country-list';
import {
	BillingTransaction,
	BillingTransactionItem,
} from 'calypso/state/billing-transactions/types';

interface GroupedDomainProduct {
	product: BillingTransactionItem;
	groupCount: number;
}

export const groupDomainProducts = (
	originalItems: BillingTransactionItem[],
	translate: LocalizeProps[ 'translate' ]
) => {
	const domainProducts: BillingTransactionItem[] = [];
	const otherProducts: BillingTransactionItem[] = [];
	originalItems.forEach( ( item ) => {
		if ( item.product_slug === 'wp-domains' ) {
			domainProducts.push( item );
		} else {
			otherProducts.push( item );
		}
	} );

	const groupedDomainProductsMap = domainProducts.reduce<
		Map< BillingTransactionItem[ 'domain' ], GroupedDomainProduct >
	>( ( groups, product ) => {
		const existingGroup = groups.get( product.domain );
		if ( existingGroup ) {
			existingGroup.product.raw_amount += product.raw_amount;
			existingGroup.product.amount_integer += product.amount_integer;
			existingGroup.groupCount++;
		} else {
			const newGroup = {
				product: { ...product },
				groupCount: 1,
			};
			groups.set( product.domain, newGroup );
		}

		return groups;
	}, new Map() );

	const groupedDomainProducts: BillingTransactionItem[] = [];

	groupedDomainProductsMap.forEach( ( value ) => {
		if ( value.groupCount === 1 ) {
			groupedDomainProducts.push( value.product );
			return;
		}
		groupedDomainProducts.push( {
			...value.product,
			amount: formatCurrency( value.product.amount_integer, value.product.currency, {
				isSmallestUnit: true,
				stripZeros: true,
			} ),
			variation: translate( 'Domain Registration' ),
		} );
	} );

	return [ ...otherProducts, ...groupedDomainProducts ];
};

export function transactionIncludesTax( transaction: BillingTransaction ) {
	if ( ! transaction || ! transaction.tax_integer ) {
		return false;
	}

	// Consider the whole transaction to include tax if any item does
	return transaction.items.some( ( item ) => item.tax_integer > 0 );
}

export function TransactionAmount( {
	transaction,
	addingTax = false,
}: {
	transaction: BillingTransaction;
	addingTax?: boolean;
} ): JSX.Element {
	const translate = useTranslate();
	const taxName = useTaxName( transaction.tax_country_code );

	if ( ! transactionIncludesTax( transaction ) ) {
		return (
			<>
				{ formatCurrency( transaction.amount_integer, transaction.currency, {
					isSmallestUnit: true,
					stripZeros: true,
				} ) }
			</>
		);
	}

	const addingTaxString = taxName
		? translate( '(+%(taxAmount)s %(taxName)s)', {
				args: {
					taxAmount: formatCurrency( transaction.tax_integer, transaction.currency, {
						isSmallestUnit: true,
						stripZeros: true,
					} ),
					taxName,
				},
				comment:
					'taxAmount is a localized price, like $12.34 | taxName is a localized tax, like VAT or GST',
		  } )
		: translate( '(+%(taxAmount)s tax)', {
				args: {
					taxAmount: formatCurrency( transaction.tax_integer, transaction.currency, {
						isSmallestUnit: true,
						stripZeros: true,
					} ),
				},
				comment: 'taxAmount is a localized price, like $12.34',
		  } );

	const includesTaxString = taxName
		? translate( '(includes %(taxAmount)s %(taxName)s)', {
				args: {
					taxAmount: formatCurrency( transaction.tax_integer, transaction.currency, {
						isSmallestUnit: true,
						stripZeros: true,
					} ),
					taxName,
				},
				comment:
					'taxAmount is a localized price, like $12.34 | taxName is a localized tax, like VAT or GST',
		  } )
		: translate( '(includes %(taxAmount)s tax)', {
				args: {
					taxAmount: formatCurrency( transaction.tax_integer, transaction.currency, {
						isSmallestUnit: true,
						stripZeros: true,
					} ),
				},
				comment: 'taxAmount is a localized price, like $12.34',
		  } );

	const taxAmount = addingTax ? addingTaxString : includesTaxString;

	return (
		<Fragment>
			<div>
				{ formatCurrency( transaction.amount_integer, transaction.currency, {
					isSmallestUnit: true,
					stripZeros: true,
				} ) }
			</div>
			<div className="billing-history__transaction-tax-amount">{ taxAmount }</div>
		</Fragment>
	);
}

function renderTransactionQuantitySummaryForMailboxes(
	licensed_quantity: number,
	new_quantity: number,
	isRenewal: boolean,
	isUpgrade: boolean,
	translate: LocalizeProps[ 'translate' ]
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

function renderDIFMTransactionQuantitySummary(
	licensed_quantity: number,
	translate: LocalizeProps[ 'translate' ]
) {
	return translate(
		'One-time fee includes %(quantity)d page',
		'One-time fee includes %(quantity)d pages',
		{
			args: { quantity: licensed_quantity },
			count: licensed_quantity,
			comment: '%(quantity)d is number of pages included in the purchase of the DIFM service',
		}
	);
}

export function renderTransactionQuantitySummary(
	{ licensed_quantity, new_quantity, type, wpcom_product_slug }: BillingTransactionItem,
	translate: LocalizeProps[ 'translate' ]
) {
	if ( ! licensed_quantity ) {
		return null;
	}

	licensed_quantity = parseInt( String( licensed_quantity ) );
	new_quantity = parseInt( String( new_quantity ) );
	const product = { product_slug: wpcom_product_slug };
	const isRenewal = 'recurring' === type;
	const isUpgrade = 'new purchase' === type && new_quantity > 0;

	if ( isGoogleWorkspace( product ) || isTitanMail( product ) ) {
		return renderTransactionQuantitySummaryForMailboxes(
			licensed_quantity,
			new_quantity,
			isRenewal,
			isUpgrade,
			translate
		);
	}

	if ( isDIFMProduct( product ) ) {
		return renderDIFMTransactionQuantitySummary( licensed_quantity, translate );
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

export function getTransactionTermLabel(
	transaction: BillingTransactionItem,
	translate: LocalizeProps[ 'translate' ]
) {
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
