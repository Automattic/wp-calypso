import { type Fields, type Operator } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { capitalPDangit } from 'calypso/lib/formatting';
import {
	isInternalA4AAgencyDomain,
	isSitelessDomainForBillingAndReceipts,
} from 'calypso/me/purchases/utils';
import {
	getTransactionTermLabel,
	groupDomainProducts,
	TransactionAmount,
	renderTransactionQuantitySummary,
	formatDisplayDate,
	formatMonthYear,
	formatMonthYearLabel,
} from './utils';
import type {
	BillingTransaction,
	BillingTransactionItem,
} from 'calypso/state/billing-transactions/types';

function renderServiceNameDescription(
	transaction: BillingTransactionItem,
	translate: ReturnType< typeof useTranslate >
) {
	const plan = capitalPDangit( transaction.variation );
	const termLabel = getTransactionTermLabel( transaction, translate );

	// Hide domains for siteless transactions (Passport URL (siteless.marketplace.wp.com), A4A agency, and a4a purchases)
	// These are internal/system domains that don't represent user sites
	const isSitelessDomain = isSitelessDomainForBillingAndReceipts( transaction.domain );
	const shouldShowDomain =
		transaction.domain && ! isSitelessDomain && ! isInternalA4AAgencyDomain( transaction.domain );
	return (
		<div>
			<strong>{ plan }</strong>
			{ shouldShowDomain && <small>{ transaction.domain }</small> }
			{ termLabel && <small>{ termLabel }</small> }
			{ transaction.licensed_quantity && (
				<small>{ renderTransactionQuantitySummary( transaction, translate ) }</small>
			) }
		</div>
	);
}

function renderServiceName(
	transaction: BillingTransaction,
	translate: ReturnType< typeof useTranslate >
) {
	const [ transactionItem, ...moreTransactionItems ] = groupDomainProducts(
		transaction.items,
		translate
	);

	if ( moreTransactionItems.length > 0 ) {
		return <strong>{ translate( 'Multiple items' ) }</strong>;
	}

	if ( transactionItem.product === transactionItem.variation ) {
		return transactionItem.product;
	}

	return renderServiceNameDescription( transactionItem, translate );
}

function getUniqueMonths(
	transactions: BillingTransaction[]
): Array< { value: string; label: string } > {
	const monthsMap = new Map< string, Date >();

	transactions.forEach( ( transaction ) => {
		const date = new Date( transaction.date );
		const formatted = formatMonthYear( date );
		monthsMap.set( formatted, date );
	} );

	return Array.from( monthsMap.entries() )
		.sort( ( [ , dateA ], [ , dateB ] ) => dateB.getTime() - dateA.getTime() )
		.map( ( [ value, date ] ) => ( {
			value,
			label: formatMonthYearLabel( date ),
		} ) );
}

function getUniqueServices(
	transactions: BillingTransaction[]
): Array< { value: string; label: string } > {
	const uniqueServices = new Set( transactions.map( ( transaction ) => transaction.service ) );

	return Array.from( uniqueServices )
		.sort()
		.map( ( service ) => ( {
			value: service,
			label: service,
		} ) );
}

function getUniqueTransactionTypes(
	transactions: BillingTransaction[]
): Array< { value: string; label: string } > {
	const typeMap = new Map< string, string >();

	transactions
		.flatMap( ( transaction ) => transaction.items )
		.forEach( ( item ) => {
			if ( item.type && ! typeMap.has( item.type ) ) {
				typeMap.set( item.type, item.type_localized || item.type );
			}
		} );

	return Array.from( typeMap.entries() )
		.sort( ( [ a ], [ b ] ) => a.localeCompare( b ) )
		.map( ( [ value, label ] ) => ( {
			value,
			label,
		} ) );
}

export function getFieldDefinitions(
	transactions: BillingTransaction[] | null,
	translate: ReturnType< typeof useTranslate >,
	getReceiptUrlFor: ( receiptId: string ) => string
): Fields< BillingTransaction > {
	return [
		{
			id: 'date',
			label: translate( 'Date' ),
			type: 'text' as const,
			elements: getUniqueMonths( transactions ?? [] ),
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			filterBy: {
				operators: [ 'is' as Operator ],
			},
			getValue: ( { item }: { item: BillingTransaction } ) => {
				return formatMonthYear( new Date( item.date ) );
			},
			render: ( { item }: { item: BillingTransaction } ) => {
				return <time>{ formatDisplayDate( new Date( item.date ) ) }</time>;
			},
		},
		{
			id: 'service',
			label: translate( 'App' ),
			type: 'text' as const,
			elements: getUniqueServices( transactions ?? [] ),
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			filterBy: {
				operators: [ 'is' as Operator ],
			},
			render: ( { item }: { item: BillingTransaction } ) => {
				return (
					<div className="billing-history__item-service">
						<a
							title={ translate( 'View receipt', { textOnly: true } ) }
							href={ getReceiptUrlFor( item.id ) }
						>
							{ renderServiceName( item, translate ) }
						</a>
					</div>
				);
			},
			getValue: ( { item }: { item: BillingTransaction } ) => {
				const [ transactionItem ] = groupDomainProducts( item.items, translate );
				if ( transactionItem.product === transactionItem.variation ) {
					return transactionItem.product;
				}
				return capitalPDangit( transactionItem.variation );
			},
		},
		{
			id: 'type',
			label: translate( 'Type' ),
			type: 'text' as const,
			elements: getUniqueTransactionTypes( transactions ?? [] ),
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			filterBy: {
				operators: [ 'is' as Operator ],
			},
			render: ( { item }: { item: BillingTransaction } ) => {
				const [ transactionItem ] = groupDomainProducts( item.items, translate );
				return <div>{ transactionItem.type_localized || transactionItem.type }</div>;
			},
			getValue: ( { item }: { item: BillingTransaction } ) => {
				const [ transactionItem ] = groupDomainProducts( item.items, translate );
				return transactionItem.type;
			},
		},
		{
			id: 'amount',
			label: translate( 'Amount' ),
			type: 'text' as const,
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			filterBy: false,
			getValue: ( { item }: { item: BillingTransaction } ) => {
				return item.amount_integer;
			},
			render: ( { item }: { item: BillingTransaction } ) => {
				return <TransactionAmount transaction={ item } />;
			},
		},
	];
}
