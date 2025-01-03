import { type Operator } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import moment from 'moment';
import { capitalPDangit } from 'calypso/lib/formatting';
import { DATE_FORMATS, TRANSACTION_TYPES } from './constants';
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

export const getFieldDefinitions = (
	transactions: BillingTransaction[] | null,
	hiddenFields: string[],
	translate: ReturnType< typeof useTranslate >
) => ( {
	date: {
		id: 'date',
		label: 'Date',
		type: 'text' as const,
		width: '15%',
		elements: getUniqueMonths( transactions ?? [] ),
		enableGlobalSearch: true,
		enableHiding: true,
		enableSorting: true,
		isHidden: hiddenFields.includes( 'date' ),
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
		label: 'App',
		type: 'text' as const,
		width: '45%',
		elements: getUniqueServices( transactions ?? [] ),
		enableGlobalSearch: true,
		enableHiding: true,
		enableSorting: true,
		isHidden: hiddenFields.includes( 'service' ),
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
		label: 'Type',
		type: 'text' as const,
		width: '20%',
		elements: [ TRANSACTION_TYPES.NEW_PURCHASE, TRANSACTION_TYPES.RENEWAL ],
		enableGlobalSearch: true,
		enableHiding: true,
		enableSorting: true,
		isHidden: hiddenFields.includes( 'type' ),
		filterBy: {
			operators: [ 'is' as Operator ],
		},
		render: ( { item }: { item: BillingTransaction } ) => {
			const [ transactionItem ] = groupDomainProducts( item.items, translate );
			return (
				<div>{ transactionItem.type_localized || capitalPDangit( transactionItem.type ) }</div>
			);
		},
		getValue: ( { item }: { item: BillingTransaction } ) => {
			const [ transactionItem ] = groupDomainProducts( item.items, translate );
			return transactionItem.type;
		},
	},
	amount: {
		id: 'amount',
		label: 'Amount',
		type: 'text' as const,
		width: '20%',
		enableGlobalSearch: true,
		enableHiding: true,
		enableSorting: true,
		isHidden: hiddenFields.includes( 'amount' ),
		getValue: ( { item }: { item: BillingTransaction } ) => {
			return item.amount_integer;
		},
		render: ( { item }: { item: BillingTransaction } ) => {
			return <TransactionAmount transaction={ item } />;
		},
	},
} );
