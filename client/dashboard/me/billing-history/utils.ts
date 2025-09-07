import { __, sprintf } from '@wordpress/i18n';
import { capitalPDangit } from 'calypso/lib/formatting';
import type {
	BillingTransaction,
	BillingTransactionItem,
} from 'calypso/state/billing-transactions/types';

export function getTransactionTermLabel(
	transaction: BillingTransactionItem,
	translate: typeof __
): string {
	if ( transaction.months_per_renewal_cycle ) {
		return sprintf(
			translate( '%d month', '%d months', { count: transaction.months_per_renewal_cycle } ),
			transaction.months_per_renewal_cycle
		);
	}
	return '';
}

export function renderTransactionQuantitySummary(
	transaction: BillingTransactionItem,
	translate: typeof __
): string {
	if ( transaction.licensed_quantity > 1 ) {
		return sprintf(
			translate( '%d license', '%d licenses', { count: transaction.licensed_quantity } ),
			transaction.licensed_quantity
		);
	}
	return '';
}

export function groupDomainProducts(
	items: BillingTransactionItem[],
	translate: typeof __
): BillingTransactionItem[] {
	if ( items.length <= 1 ) {
		return items;
	}

	// Group domain items together
	const domainItems = items.filter( ( item ) => item.product && item.product.includes( 'domain' ) );
	const otherItems = items.filter(
		( item ) => ! item.product || ! item.product.includes( 'domain' )
	);

	if ( domainItems.length > 1 ) {
		// Create a summary item for multiple domains
		const summaryItem: BillingTransactionItem = {
			...domainItems[ 0 ],
			variation: translate( 'Multiple domains' ),
			product: translate( 'Domain services' ),
		};
		return [ summaryItem, ...otherItems ];
	}

	return items;
}

export function formatDisplayDate( date: Date ): string {
	return date.toLocaleDateString( undefined, {
		year: 'numeric',
		month: 'long',
		day: 'numeric',
	} );
}

export function formatMonthYear( date: Date ): string {
	return date.toISOString().substring( 0, 7 ); // Returns YYYY-MM format
}

export function formatMonthYearLabel( date: Date ): string {
	return date.toLocaleDateString( undefined, {
		year: 'numeric',
		month: 'long',
	} );
}

export function getTransactionAmount( transaction: BillingTransaction ): string {
	const amount = transaction.amount || '';

	// Handle different currency formats
	if ( typeof amount === 'string' && amount.includes( '$' ) ) {
		return amount;
	}

	if ( transaction.amount_integer && transaction.currency ) {
		const formattedAmount = ( transaction.amount_integer / 100 ).toFixed( 2 );
		const currencySymbol = transaction.currency === 'USD' ? '$' : transaction.currency;
		return `${ currencySymbol }${ formattedAmount }`;
	}

	return amount;
}
