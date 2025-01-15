import {
	getPlanTermLabel,
	isDIFMProduct,
	isGoogleWorkspace,
	isTitanMail,
	isTieredVolumeSpaceAddon,
} from '@automattic/calypso-products';
import formatCurrency from '@automattic/format-currency';
import { LocalizeProps, useTranslate } from 'i18n-calypso';
import { Fragment } from 'react';
import { useTaxName } from 'calypso/my-sites/checkout/src/hooks/use-country-list';
import {
	BillingTransaction,
	BillingTransactionItem,
	ReceiptCostOverride,
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
			const mergedOverrides: ReceiptCostOverride[] = [];
			existingGroup.product.cost_overrides = existingGroup.product.cost_overrides.map(
				( existingGroupOverride ) => {
					const productOverride = product.cost_overrides.find(
						( override ) => override.override_code === existingGroupOverride.override_code
					);
					if ( productOverride ) {
						mergedOverrides.push( productOverride );
						return {
							...existingGroupOverride,
							new_price_integer:
								existingGroupOverride.new_price_integer + productOverride.new_price_integer,
							old_price_integer:
								existingGroupOverride.old_price_integer + productOverride.old_price_integer,
						};
					}
					return existingGroupOverride;
				}
			);
			product.cost_overrides.forEach( ( override ) => {
				if ( ! mergedOverrides.some( ( merged ) => merged.id === override.id ) ) {
					existingGroup.product.cost_overrides.push( override );
				}
			} );
			existingGroup.product.raw_amount += product.raw_amount;
			existingGroup.product.amount_integer += product.amount_integer;
			existingGroup.product.subtotal_integer += product.subtotal_integer;
			existingGroup.product.tax_integer += product.tax_integer;
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
}: {
	transaction: BillingTransaction;
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

	return (
		<Fragment>
			<div>
				{ formatCurrency( transaction.amount_integer, transaction.currency, {
					isSmallestUnit: true,
					stripZeros: true,
				} ) }
			</div>
			<div className="transaction-amount__tax-amount">{ includesTaxString }</div>
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

function renderSpaceAddOnquantitySummary(
	licensed_quantity: number,
	isRenewal: boolean,
	translate: LocalizeProps[ 'translate' ]
) {
	if ( isRenewal ) {
		return translate( 'Renewal for %(quantity)d GB', {
			args: { quantity: licensed_quantity },
			comment: '%(quantity)d is number of GBs renewed',
		} );
	}

	return translate( 'Purchase of %(quantity)d GB', {
		args: { quantity: licensed_quantity },
		comment: '%(quantity)d is number of GBs purchased',
	} );
}

export function renderDomainTransactionVolumeSummary(
	{ volume, product_slug, type }: BillingTransactionItem,
	translate: LocalizeProps[ 'translate' ]
) {
	if ( ! volume ) {
		return null;
	}

	const isRenewal = 'recurring' === type;

	volume = parseInt( String( volume ) );

	if ( 'wp-domains' !== product_slug ) {
		return null;
	}

	if ( isRenewal ) {
		return translate(
			'Domain renewed for %(quantity)d year',
			'Domain renewed for %(quantity)d years',
			{
				args: { quantity: volume },
				count: volume,
				comment: '%(quantity)d is the number of years the domain has been renewed for',
			}
		);
	}

	return translate(
		'Domain registered for %(quantity)d year',
		'Domain registered for %(quantity)d years',
		{
			args: { quantity: volume },
			count: volume,
			comment: '%(quantity)d is number of years the domain has been registered for',
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

	if ( isTieredVolumeSpaceAddon( product ) ) {
		return renderSpaceAddOnquantitySummary( licensed_quantity, isRenewal, translate );
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

export function formatDisplayDate( date: Date ): string {
	return date.toLocaleDateString( undefined, {
		year: 'numeric',
		month: 'short',
		day: 'numeric',
	} );
}

export function formatMonthYearLabel( date: Date ): string {
	return date.toLocaleDateString( undefined, {
		year: 'numeric',
		month: 'long',
	} );
}

export function formatMonthYear( date: Date ): string {
	const year = date.getFullYear();
	const month = String( date.getMonth() + 1 ).padStart( 2, '0' );
	return `${ year }-${ month }`;
}
