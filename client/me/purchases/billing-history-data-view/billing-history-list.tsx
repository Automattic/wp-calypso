import pageRedirect from '@automattic/calypso-router';
import { Gridicon } from '@automattic/components';
import { DataViews, Operator } from '@wordpress/dataviews';
import { localize, LocalizeProps } from 'i18n-calypso';
import moment from 'moment';
import { connect } from 'react-redux';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { capitalPDangit } from 'calypso/lib/formatting';
import { recordGoogleEvent } from 'calypso/state/analytics/actions';
import { sendBillingReceiptEmail as sendBillingReceiptEmailAction } from 'calypso/state/billing-transactions/actions';
import {
	BillingTransaction,
	BillingTransactionItem,
} from 'calypso/state/billing-transactions/types';
import { setPage } from 'calypso/state/billing-transactions/ui/actions';
import getBillingTransactionFilters from 'calypso/state/selectors/get-billing-transaction-filters';
import getPastBillingTransactions from 'calypso/state/selectors/get-past-billing-transactions';
import isSendingBillingReceiptEmail from 'calypso/state/selectors/is-sending-billing-receipt-email';
import { IAppState } from 'calypso/state/types';
import { filterTransactions, paginateTransactions } from './filter-transactions';
import {
	getTransactionTermLabel,
	groupDomainProducts,
	TransactionAmount,
	renderTransactionQuantitySummary,
} from './utils';

import '@wordpress/dataviews/build-style/style.css';
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
	siteId?: string | number | null;
	getReceiptUrlFor: ( receiptId: string ) => string;
}

export interface BillingHistoryListConnectedProps {
	app?: string;
	date: { newest: boolean };
	page: number;
	pageSize: number;
	query: string;
	total: number;
	transactions: BillingTransaction[];
	sendingBillingReceiptEmail: ( receiptId: string ) => boolean;
	moment: typeof moment;
	sendBillingReceiptEmail: ( receiptId: string ) => void;
	setPage: ( transactionType: string, page: number ) => void;
}

type Props = BillingHistoryListProps & BillingHistoryListConnectedProps & LocalizeProps;

const BillingHistoryListDataView: React.FC< Props > = ( {
	getReceiptUrlFor,
	page,
	pageSize,
	total,
	transactions = [],
	sendBillingReceiptEmail,
	setPage,
	translate,
	moment,
} ) => {
	const onChangeView = ( newView: { page?: number } ) => {
		const newPage = typeof newView.page === 'number' ? newView.page : 1;
		if ( newView.page !== page ) {
			setPage( 'past', newPage );
		}
	};

	const getFields = () => [
		{
			id: 'date',
			label: 'Date',
			type: 'datetime' as const,
			enableGlobalSearch: true,
			enableHiding: false,
			getValue: ( { item }: { item: BillingTransaction } ) => {
				return item.date;
			},
			render: ( { item }: { item: BillingTransaction } ) => {
				return <time>{ moment( item.date ).format( 'll' ) }</time>;
			},
		},
		{
			id: 'service',
			label: 'Summary',
			type: 'text' as const,
			elements: SERVICES,
			enableGlobalSearch: true,
			enableHiding: false,
			render: ( { item }: { item: BillingTransaction } ) => {
				return <div>{ serviceName( item, translate ) }</div>;
			},
			getValue: ( { item }: { item: BillingTransaction } ) => {
				return item.service;
			},
			filterBy: {
				operators: [ 'isAny', 'is', 'isAny' ] as Operator[],
			},
		},
		{
			id: 'amount',
			label: 'Amount',
			type: 'text' as const,
			enableGlobalSearch: true,
			render: ( { item }: { item: BillingTransaction } ) => {
				return <TransactionAmount transaction={ item } />;
			},
		},
	];

	const getView = () => ( {
		type: 'table' as const,
		search: '',
		filters: [],
		page,
		perPage: pageSize,
		sort: {
			field: 'date',
			direction: 'desc' as const,
		},
		titleField: 'title',
		fields: [ 'date', 'service', 'amount' ],
		layout: {},
	} );

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
					data={ transactions || [] }
					paginationInfo={ {
						totalItems: total,
						totalPages: Math.ceil( total / pageSize ),
					} }
					fields={ getFields() }
					view={ getView() }
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
	( state: IAppState, { siteId }: BillingHistoryListProps ) => {
		const transactions = getPastBillingTransactions( state );
		const pageSize = 10;
		const filteredTransactions = transactions && filterTransactions( transactions, {}, siteId );

		const uiState = getBillingTransactionFilters( state, 'past' );
		const currentPage = uiState?.page ? uiState.page : 1;

		const paginatedTransactions =
			filteredTransactions && paginateTransactions( filteredTransactions, currentPage, pageSize );

		return {
			page: currentPage,
			pageSize,
			total: filteredTransactions?.length ?? 0,
			transactions: paginatedTransactions,
			sendingBillingReceiptEmail: getIsSendingReceiptEmail( state ),
		};
	},
	{
		setPage,
		sendBillingReceiptEmail: sendBillingReceiptEmailAction,
	}
)( localize( withLocalizedMoment( BillingHistoryListDataView ) ) );
