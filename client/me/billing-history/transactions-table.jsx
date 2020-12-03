/**
 * External dependencies
 */
import { isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import titleCase from 'to-title-case';
import { capitalPDangit } from 'calypso/lib/formatting';

/**
 * Internal dependencies
 */
import { CompactCard } from '@automattic/components';
import Pagination from 'calypso/components/pagination';
import TransactionsHeader from './transactions-header';
import { groupDomainProducts, renderTransactionAmount } from './utils';
import { withLocalizedMoment } from 'calypso/components/localized-moment';
import { setPage } from 'calypso/state/billing-transactions/ui/actions';
import getBillingTransactionFilters from 'calypso/state/selectors/get-billing-transaction-filters';
import getFilteredBillingTransactions from 'calypso/state/selectors/get-filtered-billing-transactions';
import { getPlanTermLabel } from 'calypso/lib/plans';

class TransactionsTable extends React.Component {
	static displayName = 'TransactionsTable';

	static defaultProps = {
		header: false,
	};

	onPageClick = ( page ) => {
		this.props.setPage( this.props.transactionType, page );
	};

	render() {
		let header;

		if ( false !== this.props.header ) {
			header = (
				<TransactionsHeader
					transactionType={ this.props.transactionType }
					siteId={ this.props.siteId }
				/>
			);
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

	serviceName = ( transaction ) => {
		if ( ! transaction.items ) {
			return this.serviceNameDescription( transaction );
		}

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

		return this.serviceNameDescription( {
			...transactionItem,
			plan: capitalPDangit( titleCase( transactionItem.variation ) ),
		} );
	};

	serviceNameDescription = ( transaction ) => {
		let description;
		if ( transaction.domain ) {
			const termLabel = getPlanTermLabel( transaction.wpcom_product_slug, this.props.translate );
			description = (
				<div>
					<strong>{ transaction.plan }</strong>
					<small>{ transaction.domain }</small>
					{ termLabel ? <small>{ termLabel }</small> : null }
				</div>
			);
		} else {
			description = (
				<strong>
					{ transaction.product } { transaction.plan }
				</strong>
			);
		}

		return description;
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
		const { transactions, date, app, query, transactionType, translate } = this.props;
		if ( ! transactions ) {
			return this.renderPlaceholder();
		}

		if ( isEmpty( transactions ) ) {
			let noResultsText;
			if ( ! date.newest || '' !== app || '' !== query ) {
				noResultsText = this.props.noFilterResultsText;
			} else {
				noResultsText = this.props.emptyTableText;
			}
			return (
				<tr className="billing-history__no-results">
					<td className="billing-history__no-results-cell" colSpan="3">
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
								{ this.props.transactionRenderer( transaction ) }
							</div>
						</div>
					</td>
					<td className="billing-history__amount">
						{ renderTransactionAmount( transaction, {
							addingTax: transactionType === 'upcoming',
							translate,
						} ) }
					</td>
				</tr>
			);
		}, this );
	};
}

TransactionsTable.propTypes = {
	//connected props
	app: PropTypes.string,
	date: PropTypes.object,
	page: PropTypes.number,
	pageSize: PropTypes.number.isRequired,
	query: PropTypes.string.isRequired,
	total: PropTypes.number.isRequired,
	transactions: PropTypes.array,
	//own props
	siteId: PropTypes.number,
	transactionType: PropTypes.string.isRequired,
	//array allows to accept the output of translate() with components in the string
	emptyTableText: PropTypes.oneOfType( [ PropTypes.string, PropTypes.array ] ).isRequired,
	noFilterResultsText: PropTypes.oneOfType( [ PropTypes.string, PropTypes.array ] ).isRequired,
	transactionRenderer: PropTypes.func.isRequired,
	header: PropTypes.bool,
};

export default connect(
	( state, { transactionType, siteId } ) => {
		const filteredTransactions = getFilteredBillingTransactions( state, transactionType, siteId );
		const filter = getBillingTransactionFilters( state, transactionType );
		return {
			app: filter.app,
			date: filter.date,
			page: filter.page,
			pageSize: filteredTransactions.pageSize,
			query: filter.query,
			total: filteredTransactions.total,
			transactions: filteredTransactions.transactions,
		};
	},
	{
		setPage,
	}
)( localize( withLocalizedMoment( TransactionsTable ) ) );
