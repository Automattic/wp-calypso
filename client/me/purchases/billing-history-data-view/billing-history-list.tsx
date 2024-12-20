/* eslint-disable prettier/prettier */
import page from '@automattic/calypso-router';
import { Gridicon } from '@automattic/components';
import { DataViews, Operator } from '@wordpress/dataviews';
import { localize, LocalizeProps } from 'i18n-calypso';
import moment from 'moment';
import { Component } from 'react';
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
import type { MouseEvent } from 'react';

import '@wordpress/dataviews/build-style/style.css';
import './style.scss';

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

class BillingHistoryListDataView extends Component<
	BillingHistoryListProps & BillingHistoryListConnectedProps & LocalizeProps
> {
	static displayName = 'BillingHistoryList';

	static defaultProps = {
		header: false,
	};

	onPageClick = ( page: number ) => {
		this.props.setPage( 'past', page );
	};

	onChangeView = ( newView: { page?: number } ) => {
		const newPage = typeof newView.page === 'number' ? newView.page : 1;
		if ( newView.page !== this.props.page ) {
			this.props.setPage( 'past', newPage );
		}
	};

	render() {
		const transactions = this.props.transactions || [];

		return (
			<div className="billing-history">
				<div className="dataviews-wrapper">
					<DataViews
						data={ transactions }
						paginationInfo={ {
							totalItems: this.props.total,
							totalPages: Math.ceil( this.props.total / this.props.pageSize ),
						} }
						fields={ this.getFields() }
						view={ this.getView() }
						search
						searchLabel="Search receipts"
						onChangeView={ this.onChangeView }
						defaultLayouts={ { table: {} } }
						actions={ this.getActions() }
						isLoading={ false }
					/>
				</div>
			</div>
		);
	}

	serviceName = ( transaction: BillingTransaction ) => {
		const [ transactionItem, ...moreTransactionItems ] = groupDomainProducts(
			transaction.items,
			this.props.translate
		);

		if ( moreTransactionItems.length > 0 ) {
			return <strong>{ this.props.translate( 'Multiple items' ) }</strong>;
		}

		if ( transactionItem.product === transactionItem.variation ) {
			return transactionItem.product;
		}

		return this.serviceNameDescription( transactionItem );
	};

	getFields = () => {
		const SERVICES = [
			{ value: 'WordPress.com', label: 'WordPress.com' },
			{ value: 'Jetpack', label: 'Jetpack' },
			{ value: 'WooCommerce', label: 'WooCommerce' },
		];

		return [
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
					return <time>{ this.props.moment( item.date ).format( 'll' ) }</time>;
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
					return <div>{ this.serviceName( item ) }</div>;
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
	};

	getActions = () => {
		const { getReceiptUrlFor, sendBillingReceiptEmail } = this.props;
		return [
			{
				id: 'view-receipt',
				label: 'View receipt',
				isPrimary: true,
				icon: <Gridicon icon="pages" />,
				callback: ( items: BillingTransaction[] ) => {
					const item = items[ 0 ];
					page.redirect( getReceiptUrlFor( item.id ) );
				},
			},
			{
				id: 'email-receipt',
				label: 'Email receipt',
				isPrimary: true,
				icon: <Gridicon icon="mail" />,
				callback: ( items: BillingTransaction[] ) => {
					const item = items[ 0 ];
					this.recordClickEvent( 'Email Receipt in Billing History' );
					sendBillingReceiptEmail( item.id );
				},
			},
		];
	};

	getView = () => {
		const { page, pageSize } = this.props;
		return {
			type: 'table' as const,
			search: '',
			filters: [],
			page: page,
			perPage: pageSize,
			sort: {
				field: 'date',
				direction: 'desc' as const,
			},
			titleField: 'title',
			fields: [ 'date', 'service', 'amount', 'actions' ],
			layout: {},
		};
	};

	serviceNameDescription = ( transaction: BillingTransactionItem ) => {
		const plan = capitalPDangit( transaction.variation );
		const termLabel = getTransactionTermLabel( transaction, this.props.translate );
		return (
			<div>
				<strong>{ plan }</strong>
				{ transaction.domain && <small>{ transaction.domain }</small> }
				{ termLabel && <small>{ termLabel }</small> }
				{ transaction.licensed_quantity && (
					<small>{ renderTransactionQuantitySummary( transaction, this.props.translate ) }</small>
				) }
			</div>
		);
	};

	recordClickEvent = ( eventAction: string ) => {
		recordGoogleEvent( 'Me', eventAction );
	};

	handleReceiptLinkClick = () => {
		return this.recordClickEvent( 'View Receipt in Billing History' );
	};

	getEmailReceiptLinkClickHandler = ( receiptId: string ) => {
		const { sendBillingReceiptEmail } = this.props;

		return ( event: MouseEvent< HTMLButtonElement > ) => {
			event.preventDefault();
			this.recordClickEvent( 'Email Receipt in Billing History' );
			sendBillingReceiptEmail( receiptId );
		};
	};

	renderEmailAction = ( receiptId: string ) => {
		const { translate, sendingBillingReceiptEmail } = this.props;

		if ( sendingBillingReceiptEmail( receiptId ) ) {
			return translate( 'Emailing receipt…' );
		}

		return (
			<button
				className="billing-history__email-button"
				onClick={ this.getEmailReceiptLinkClickHandler( receiptId ) }
			>
				{ translate( 'Email receipt' ) }
			</button>
		);
	};

	renderActions = ( transaction: BillingTransaction ) => {
		const { translate, getReceiptUrlFor } = this.props;

		return (
			<div className="billing-history__transaction-links">
				<a
					className="billing-history__view-receipt"
					href={ getReceiptUrlFor( transaction.id ) }
					onClick={ this.handleReceiptLinkClick }
				>
					{ translate( 'View receipt' ) }
				</a>
			</div>
		);
	};
}

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
