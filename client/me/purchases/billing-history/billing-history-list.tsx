import { CompactCard } from '@automattic/components';
import { localize, LocalizeProps } from 'i18n-calypso';
import moment from 'moment';
import { Component } from 'react';
import { connect } from 'react-redux';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import Pagination from 'calypso/components/pagination';
import { capitalPDangit } from 'calypso/lib/formatting';
import BillingHistoryFilters from 'calypso/me/purchases/billing-history/billing-history-filters';
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

export interface BillingHistoryListProps {
	header?: boolean;
	siteId?: string | number | null;
	getReceiptUrlFor: ( receiptId: string ) => string;
}

export interface BillingHistoryListConnectedProps {
	app?: string;
	date: { newest: boolean };
	page?: number;
	pageSize: number;
	query: string;
	total: number;
	transactions: BillingTransaction[];
	sendingBillingReceiptEmail: ( receiptId: string ) => boolean;
	moment: typeof moment;
	sendBillingReceiptEmail: ( receiptId: string ) => void;
	setPage: ( transactionType: string, page: string ) => void;
}

class BillingHistoryList extends Component<
	BillingHistoryListProps & BillingHistoryListConnectedProps & LocalizeProps
> {
	static displayName = 'BillingHistoryList';

	static defaultProps = {
		header: false,
	};

	onPageClick = ( page: string ) => {
		this.props.setPage( 'past', page );
	};

	render() {
		let header;

		if ( false !== this.props.header ) {
			header = <BillingHistoryFilters transactionType="past" siteId={ this.props.siteId } />;
		}

		return (
			<div>
				<table className="billing-history__transactions">
					{ header }
					<tbody>{ this.renderRows() }</tbody>
				</table>
				{ this.renderPagination() }
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
				{ this.renderEmailAction( transaction.id ) }
			</div>
		);
	};

	renderPlaceholder = () => {
		return (
			<tr className="billing-history__transaction is-placeholder">
				<td>
					<div className="billing-history__transaction-text" />
				</td>
				<td className="billing-history__trans-app">
					<div className="billing-history__transaction-text" />
				</td>
				<td className="billing-history__amount">
					<div className="billing-history__transaction-text" />
				</td>
			</tr>
		);
	};

	renderPagination = () => {
		if ( this.props.total <= this.props.pageSize ) {
			return null;
		}

		return (
			<CompactCard>
				<Pagination
					page={ this.props.page }
					perPage={ this.props.pageSize }
					total={ this.props.total }
					pageClick={ this.onPageClick }
				/>
			</CompactCard>
		);
	};

	renderRows = () => {
		const { transactions, date, app, query, translate } = this.props;
		if ( ! transactions ) {
			return this.renderPlaceholder();
		}

		if ( transactions.length === 0 ) {
			let noResultsText;
			if ( ! date.newest || '' !== app || '' !== query ) {
				noResultsText = this.props.siteId
					? translate( 'You have made no purchases for this site.' )
					: translate( 'No receipts found.' );
			} else {
				noResultsText = translate(
					'You do not currently have any upgrades. ' +
						'To see what upgrades we offer visit our {{link}}Plans page{{/link}}.',
					{
						components: { link: <a href="/plans" /> },
					}
				);
			}
			return (
				<tr className="billing-history__no-results">
					<td className="billing-history__no-results-cell" colSpan={ 3 }>
						{ noResultsText }
					</td>
				</tr>
			);
		}

		return transactions.map( ( transaction ) => {
			const transactionDate = this.props.moment( transaction.date ).format( 'll' );

			return (
				<tr key={ transaction.id } className="billing-history__transaction">
					<td className="billing-history__date">{ transactionDate }</td>
					<td className="billing-history__trans-app">
						<div className="billing-history__trans-wrap">
							<div className="billing-history__service-description">
								<div className="billing-history__service-name">
									{ this.serviceName( transaction ) }
								</div>
								{ this.renderActions( transaction ) }
							</div>
						</div>
					</td>
					<td className="billing-history__amount">
						<TransactionAmount transaction={ transaction } />
					</td>
				</tr>
			);
		}, this );
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
		const filter = getBillingTransactionFilters( state, 'past' );
		const pageSize = 5;
		const filteredTransactions = transactions && filterTransactions( transactions, filter, siteId );
		const paginatedTransactions =
			filteredTransactions && paginateTransactions( filteredTransactions, filter.page, pageSize );

		return {
			app: filter.app,
			date: filter.date,
			page: filter.page,
			pageSize,
			query: filter.query,
			total: filteredTransactions?.length ?? 0,
			transactions: paginatedTransactions,
			sendingBillingReceiptEmail: getIsSendingReceiptEmail( state ),
		};
	},
	{
		setPage,
		sendBillingReceiptEmail: sendBillingReceiptEmailAction,
	}
)( localize( withLocalizedMoment( BillingHistoryList ) ) );
