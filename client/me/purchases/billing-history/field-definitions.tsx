import { type Operator } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { capitalPDangit } from 'calypso/lib/formatting';
import { DATE_FORMATS } from './constants';
import {
	getTransactionTermLabel,
	groupDomainProducts,
	TransactionAmount,
	renderTransactionQuantitySummary,
} from './utils';
import type {
	BillingTransaction,
	BillingTransactionItem,
} from 'calypso/state/billing-transactions/types';

const serviceNameDescription = (
	transaction: BillingTransactionItem,
	translate: ReturnType< typeof useTranslate >
) => {
	const plan = capitalPDangit( transaction.variation );
	const termLabel = getTransactionTermLabel( transaction, translate );
	return (
		<div>
			<strong>{ plan }</strong>
			{ transaction.domain && <small>{ transaction.domain }</small> }
			{ termLabel && <small>{ termLabel }</small> }
			{ transaction.licensed_quantity && (
				<small>{ renderTransactionQuantitySummary( transaction, translate ) }</small>
			) }
		</div>
	);
};

const serviceName = (
	transaction: BillingTransaction,
	translate: ReturnType< typeof useTranslate >
) => {
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

	return serviceNameDescription( transactionItem, translate );
};

const getUniqueMonths = (
	transactions: BillingTransaction[]
): Array< { value: string; label: string } > => {
	const uniqueMonths = new Set(
		transactions.map( ( transaction ) =>
			moment( transaction.date ).format( DATE_FORMATS.MONTH_YEAR )
		)
	);

	return Array.from( uniqueMonths )
		.sort()
		.reverse()
		.map( ( monthStr ) => ( {
			value: monthStr,
			label: moment( monthStr ).format( DATE_FORMATS.MONTH_YEAR_LABEL ),
		} ) );
};

const getUniqueServices = (
	transactions: BillingTransaction[]
): Array< { value: string; label: string } > => {
	const uniqueServices = new Set( transactions.map( ( transaction ) => transaction.service ) );

	return Array.from( uniqueServices )
		.sort()
		.map( ( service ) => ( {
			value: service,
			label: service,
		} ) );
};

const getUniqueTransactionTypes = (
	transactions: BillingTransaction[]
): Array< { value: string; label: string } > => {
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
};

export const getFieldDefinitions = (
	transactions: BillingTransaction[] | null,
	translate: ReturnType< typeof useTranslate >
) => ( {
	date: {
		id: 'date',
		label: translate( 'Date' ),
		type: 'text' as const,
		width: '15%',
		elements: getUniqueMonths( transactions ?? [] ),
		enableGlobalSearch: true,
		enableSorting: true,
		enableHiding: false,
		filterBy: {
			operators: [ 'is' as Operator ],
		},
		getValue: ( { item }: { item: BillingTransaction } ) => {
			return moment( item.date ).format( DATE_FORMATS.MONTH_YEAR );
		},
		render: ( { item }: { item: BillingTransaction } ) => {
			return <time>{ moment( item.date ).format( DATE_FORMATS.DISPLAY ) }</time>;
		},
	},
	service: {
		id: 'service',
		label: translate( 'App' ),
		type: 'text' as const,
		width: '45%',
		elements: getUniqueServices( transactions ?? [] ),
		enableGlobalSearch: true,
		enableSorting: true,
		enableHiding: false,
		filterBy: {
			operators: [ 'is' as Operator ],
		},
		render: ( { item }: { item: BillingTransaction } ) => {
			return <div>{ serviceName( item, translate ) }</div>;
		},
		getValue: ( { item }: { item: BillingTransaction } ) => {
			const [ transactionItem ] = groupDomainProducts( item.items, translate );
			if ( transactionItem.product === transactionItem.variation ) {
				return transactionItem.product;
			}
			return capitalPDangit( transactionItem.variation );
		},
	},
	type: {
		id: 'type',
		label: translate( 'Type' ),
		type: 'text' as const,
		width: '20%',
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
	amount: {
		id: 'amount',
		label: translate( 'Amount' ),
		type: 'text' as const,
		width: '20%',
		enableGlobalSearch: true,
		enableSorting: true,
		enableHiding: false,
		filterBy: {
			operators: [ 'is' as Operator ],
		},
		getValue: ( { item }: { item: BillingTransaction } ) => {
			return item.amount_integer;
		},
		render: ( { item }: { item: BillingTransaction } ) => {
			return <TransactionAmount transaction={ item } />;
		},
	},
} );
