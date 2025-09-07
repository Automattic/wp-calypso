import { Link } from '@tanstack/react-router';
import { __, sprintf } from '@wordpress/i18n';
import { capitalPDangit } from 'calypso/lib/formatting';
import { isInternalA4AAgencyDomain } from 'calypso/me/purchases/utils';
import { TransactionAmount } from './transaction-amount';
import {
	getTransactionTermLabel,
	groupDomainProducts,
	renderTransactionQuantitySummary,
	formatDisplayDate,
	formatMonthYear,
	formatMonthYearLabel,
} from './utils';
import type { Fields, Operator } from '@wordpress/dataviews';
import type {
	BillingTransaction,
	BillingTransactionItem,
} from 'calypso/state/billing-transactions/types';

function renderServiceNameDescription( transaction: BillingTransactionItem ) {
	const plan = capitalPDangit( transaction.variation );
	const termLabel = getTransactionTermLabel( transaction, __ );

	const shouldShowDomain = transaction.domain && ! isInternalA4AAgencyDomain( transaction.domain );
	return (
		<div>
			<strong>{ plan }</strong>
			{ shouldShowDomain && <small>{ transaction.domain }</small> }
			{ termLabel && <small>{ termLabel }</small> }
			{ transaction.licensed_quantity && (
				<small>{ renderTransactionQuantitySummary( transaction, __ ) }</small>
			) }
		</div>
	);
}

function renderServiceName( transaction: BillingTransaction ) {
	const [ transactionItem, ...moreTransactionItems ] = groupDomainProducts( transaction.items, __ );

	if ( moreTransactionItems.length > 0 ) {
		return <strong>{ __( 'Multiple items' ) }</strong>;
	}

	if ( transactionItem.product === transactionItem.variation ) {
		return transactionItem.product;
	}

	return renderServiceNameDescription( transactionItem );
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
	getReceiptUrlFor: ( receiptId: string ) => string
): Fields< BillingTransaction > {
	return [
		{
			id: 'date',
			label: __( 'Date' ),
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
			label: __( 'App' ),
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
						<a title={ __( 'View receipt' ) } href={ getReceiptUrlFor( item.id ) }>
							{ renderServiceName( item ) }
						</a>
					</div>
				);
			},
			getValue: ( { item }: { item: BillingTransaction } ) => {
				const [ transactionItem ] = groupDomainProducts( item.items, __ );
				if ( transactionItem.product === transactionItem.variation ) {
					return transactionItem.product;
				}
				return capitalPDangit( transactionItem.variation );
			},
		},
		{
			id: 'type',
			label: __( 'Type' ),
			type: 'text' as const,
			elements: getUniqueTransactionTypes( transactions ?? [] ),
			enableGlobalSearch: true,
			enableSorting: true,
			enableHiding: false,
			filterBy: {
				operators: [ 'is' as Operator ],
			},
			render: ( { item }: { item: BillingTransaction } ) => {
				const [ transactionItem ] = groupDomainProducts( item.items, __ );
				return <div>{ transactionItem.type_localized || transactionItem.type }</div>;
			},
			getValue: ( { item }: { item: BillingTransaction } ) => {
				const [ transactionItem ] = groupDomainProducts( item.items, __ );
				return transactionItem.type;
			},
		},
		{
			id: 'amount',
			label: __( 'Amount' ),
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
