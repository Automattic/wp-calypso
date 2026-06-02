import { isAkismetPro500, getAkismetPro500ProductDisplayName } from '@automattic/calypso-products';
import { formatCurrency } from '@automattic/number-formatters';
import { type Fields, type Operator } from '@wordpress/dataviews';
import { useTranslate } from 'i18n-calypso';
import { capitalPDangit } from 'calypso/lib/formatting';
import { wideFields } from './constants';
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
	const isAkismet = isAkismetPro500( { product_slug: transaction.wpcom_product_slug } );
	const planName = isAkismet
		? String(
				getAkismetPro500ProductDisplayName( transaction.variation, transaction.licensed_quantity )
		  )
		: transaction.variation;
	const plan = capitalPDangit( planName );
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
		.sort( ( [ a ], [ b ] ) => String( a ).localeCompare( String( b ) ) )
		.map( ( [ value, label ] ) => ( {
			value,
			label,
		} ) );
}

function renderInlineHiddenField( key: string, label: string, value: string ) {
	return (
		<span key={ key } className="billing-history__item-meta">
			<span className="billing-history__item-meta-label">{ label }</span>
			<span className="billing-history__item-meta-value">{ value }</span>
		</span>
	);
}

function renderInlineHiddenFields(
	transaction: BillingTransaction,
	translate: ReturnType< typeof useTranslate >,
	visibleFields: string[]
) {
	const [ transactionItem ] = groupDomainProducts( transaction.items, translate );
	const lines: JSX.Element[] = [];

	if ( ! visibleFields.includes( 'date' ) ) {
		lines.push(
			renderInlineHiddenField(
				'date',
				translate( 'Date' ),
				formatDisplayDate( new Date( transaction.date ) )
			)
		);
	}
	if ( ! visibleFields.includes( 'type' ) ) {
		lines.push(
			renderInlineHiddenField(
				'type',
				translate( 'Type' ),
				transactionItem.type_localized || transactionItem.type
			)
		);
	}
	if ( ! visibleFields.includes( 'amount' ) ) {
		lines.push(
			renderInlineHiddenField(
				'amount',
				translate( 'Amount' ),
				formatCurrency( transaction.amount_integer, transaction.currency, {
					isSmallestUnit: true,
					stripZeros: true,
				} )
			)
		);
	}
	return lines;
}

export function getFieldDefinitions(
	transactions: BillingTransaction[] | null,
	translate: ReturnType< typeof useTranslate >,
	getReceiptUrlFor: ( receiptId: string ) => string,
	visibleFields: string[] = wideFields
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
						{ renderInlineHiddenFields( item, translate, visibleFields ) }
					</div>
				);
			},
			getValue: ( { item }: { item: BillingTransaction } ) => {
				const [ transactionItem ] = groupDomainProducts( item.items, translate );
				if ( transactionItem.product === transactionItem.variation ) {
					return String( transactionItem.product );
				}
				const isAkismet = isAkismetPro500( { product_slug: transactionItem.wpcom_product_slug } );
				const name = isAkismet
					? String(
							getAkismetPro500ProductDisplayName(
								transactionItem.variation,
								transactionItem.licensed_quantity
							)
					  )
					: transactionItem.variation;
				return capitalPDangit( name );
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
				return String( transactionItem.type || '' );
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
				return String( item.amount_integer );
			},
			render: ( { item }: { item: BillingTransaction } ) => {
				return <TransactionAmount transaction={ item } />;
			},
		},
	];
}
