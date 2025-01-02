import pageRedirect from '@automattic/calypso-router';
import { Gridicon } from '@automattic/components';
import { DataViews, Operator } from '@wordpress/dataviews';
import { localize, LocalizeProps } from 'i18n-calypso';
import { isEqual } from 'lodash';
import moment from 'moment';
import { useState } from 'react';
import { connect } from 'react-redux';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { capitalPDangit } from 'calypso/lib/formatting';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { sendBillingReceiptEmail as sendBillingReceiptEmailAction } from 'calypso/state/billing-transactions/actions';
import {
	BillingTransaction,
	BillingTransactionItem,
} from 'calypso/state/billing-transactions/types';
import getPastBillingTransactions from 'calypso/state/selectors/get-past-billing-transactions';
import isSendingBillingReceiptEmail from 'calypso/state/selectors/is-sending-billing-receipt-email';
import { IAppState } from 'calypso/state/types';
import {
	getTransactionTermLabel,
	groupDomainProducts,
	TransactionAmount,
	renderTransactionQuantitySummary,
} from './utils';

import 'calypso/components/dataviews/style.scss';
import './style.scss';

const SERVICES = [
	{ value: 'WordPress.com', label: 'WordPress.com' },
	{ value: 'Jetpack', label: 'Jetpack' },
	{ value: 'WooCommerce', label: 'WooCommerce' },
];

const recordClickEvent = ( eventAction: string ) => {
	recordGoogleEvent( 'Me', eventAction );
};

const serviceNameDescription = (
	transaction: BillingTransactionItem,
	translate: LocalizeProps[ 'translate' ]
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
	translate: LocalizeProps[ 'translate' ]
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

export interface BillingHistoryListProps {
	header?: boolean;
	getReceiptUrlFor: ( receiptId: string ) => string;
}

export interface BillingHistoryListConnectedProps {
	transactions: BillingTransaction[];
	sendingBillingReceiptEmail: ( receiptId: string ) => boolean;
	moment: typeof moment;
	sendBillingReceiptEmail: ( receiptId: string ) => void;
}

type Props = BillingHistoryListProps & BillingHistoryListConnectedProps & LocalizeProps;

const BillingHistoryListDataView: React.FC< Props > = ( {
	getReceiptUrlFor,
	transactions = [],
	sendBillingReceiptEmail,
	translate,
	moment,
} ) => {
	const [ view, setView ] = useState( {
		type: 'table' as const,
		search: '',
		filters: [] as Array< {
			field: string;
			operator: Operator;
			value: string | string[];
		} >,
		page: 1,
		perPage: 10,
		sort: {
			field: 'date',
			direction: 'desc' as const,
		},
		fields: [ 'date', 'service', 'amount' ],
	} );

	// Apply filtering
	const filteredTransactions = ( transactions ?? [] ).filter( ( transaction ) => {
		// Handle search
		if ( view.search ) {
			const searchTerm = view.search.toLowerCase();
			const [ transactionItem ] = groupDomainProducts( transaction.items, translate );
			const searchableFields = [
				transaction.service,
				transactionItem.product,
				transactionItem.variation,
				transactionItem.domain,
				moment( transaction.date ).format( 'll' ),
				transaction.amount,
			];

			if (
				! searchableFields.some(
					( field ) => field && field.toString().toLowerCase().includes( searchTerm )
				)
			) {
				return false;
			}
		}

		// Handle filters
		if ( view.filters.length === 0 ) {
			return true;
		}

		return view.filters.every( ( filter ) => {
			if ( filter.field === 'service' && filter.value ) {
				return transaction.service === filter.value;
			}
			if ( filter.field === 'type' && filter.value ) {
				const [ firstItem ] = groupDomainProducts( transaction.items, translate );
				return firstItem.type === filter.value;
			}
			return true;
		} );
	} );

	// Apply sorting
	const sortedTransactions = [ ...filteredTransactions ].sort( ( a, b ) => {
		let comparison = 0;
		switch ( view.sort.field ) {
			case 'date':
				comparison = new Date( a.date ).getTime() - new Date( b.date ).getTime();
				break;
			case 'service': {
				const aService = a.items.length > 0 ? a.items[ 0 ].variation : a.service;
				const bService = b.items.length > 0 ? b.items[ 0 ].variation : b.service;
				comparison = ( aService || '' ).localeCompare( bService || '' );
				break;
			}
			case 'amount':
				comparison = a.amount_integer - b.amount_integer;
				break;
			default:
				return 0;
		}
		return view.sort.direction === 'desc' ? -comparison : comparison;
	} );

	const startIndex = ( view.page - 1 ) * view.perPage;
	const paginatedTransactions = sortedTransactions.slice( startIndex, startIndex + view.perPage );

	const onChangeView = ( newView: {
		page?: number;
		perPage?: number;
		sort?: {
			field: string;
			direction: 'asc' | 'desc';
		};
		filters?: Array< {
			field: string;
			operator: Operator;
			value: string | string[];
		} >;
		search?: string;
	} ) => {
		setView( ( currentView ) => {
			const updatedView = { ...currentView };

			// Update only the changed properties
			if ( newView.page !== undefined && newView.page !== currentView.page ) {
				updatedView.page = newView.page;
			}

			if ( newView.perPage && newView.perPage !== currentView.perPage ) {
				updatedView.perPage = newView.perPage;
				updatedView.page = 1; // Reset to first page
			}

			if ( newView.sort && ! isEqual( newView.sort, currentView.sort ) ) {
				updatedView.sort = newView.sort as typeof currentView.sort;
			}

			if ( newView.filters && ! isEqual( newView.filters, currentView.filters ) ) {
				updatedView.filters = newView.filters;
				updatedView.page = 1; // Reset to first page
			}

			if ( newView.search !== undefined ) {
				updatedView.search = newView.search;
			}

			return updatedView;
		} );
	};

	const getFields = () => [
		{
			id: 'date',
			label: 'Date',
			type: 'text' as const,
			enableGlobalSearch: true,
			enableHiding: false,
			enableSorting: true,
			getValue: ( { item }: { item: BillingTransaction } ) => {
				return item.date;
			},
			render: ( { item }: { item: BillingTransaction } ) => {
				return <time>{ moment( item.date ).format( 'll' ) }</time>;
			},
		},
		{
			id: 'service',
			label: 'App',
			type: 'text' as const,
			elements: SERVICES,
			enableGlobalSearch: true,
			enableHiding: false,
			enableSorting: true,
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
		{
			id: 'type',
			label: 'Type',
			type: 'text' as const,
			elements: [
				{ value: 'new purchase', label: 'New Purchase' },
				{ value: 'recurring', label: 'Renewal' },
			],
			enableGlobalSearch: true,
			enableHiding: false,
			enableSorting: true,
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
		{
			id: 'amount',
			label: 'Amount',
			type: 'text' as const,
			enableGlobalSearch: true,
			enableSorting: true,
			getValue: ( { item }: { item: BillingTransaction } ) => {
				return item.amount_integer;
			},
			render: ( { item }: { item: BillingTransaction } ) => {
				return <TransactionAmount transaction={ item } />;
			},
		},
	];

	const getActions = () => [
		{
			id: 'view-receipt',
			label: 'View receipt',
			isPrimary: true,
			icon: <Gridicon icon="pages" />,
			callback: ( items: BillingTransaction[] ) => {
				const item = items[ 0 ];
				pageRedirect.redirect( getReceiptUrlFor( item.id ) );
			},
		},
		{
			id: 'email-receipt',
			label: 'Email receipt',
			isPrimary: true,
			icon: <Gridicon icon="mail" />,
			callback: ( items: BillingTransaction[] ) => {
				const item = items[ 0 ];
				recordClickEvent( 'Email Receipt in Billing History' );
				sendBillingReceiptEmail( item.id );
			},
		},
	];

	return (
		<div className="billing-history">
			<div className="dataviews-wrapper">
				<DataViews
					data={ paginatedTransactions }
					paginationInfo={ {
						totalItems: filteredTransactions.length,
						totalPages: Math.ceil( filteredTransactions.length / view.perPage ),
					} }
					fields={ getFields() }
					view={ view }
					search
					searchLabel="Search receipts"
					onChangeView={ onChangeView }
					defaultLayouts={ { table: {} } }
					actions={ getActions() }
					isLoading={ false }
				/>
			</div>
		</div>
	);
};

function getIsSendingReceiptEmail( state: IAppState ) {
	return function isSendingBillingReceiptEmailForReceiptId( receiptId: number ) {
		return isSendingBillingReceiptEmail( state, receiptId );
	};
}

export default connect(
	( state: IAppState ) => ( {
		transactions: getPastBillingTransactions( state ),
		sendingBillingReceiptEmail: getIsSendingReceiptEmail( state ),
	} ),
	{
		sendBillingReceiptEmail: sendBillingReceiptEmailAction,
	}
)( localize( withLocalizedMoment( BillingHistoryListDataView ) ) );
