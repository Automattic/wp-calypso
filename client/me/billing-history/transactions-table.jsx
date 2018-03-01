/** @format */

/**
 * External dependencies
 */

import { defer, isEmpty, pick, slice } from 'lodash';
import { localize } from 'i18n-calypso';
import React from 'react';
import titleCase from 'to-title-case';
import { capitalPDangit } from 'lib/formatting';

/**
 * Internal dependencies
 */
import CompactCard from 'components/card/compact';
import Pagination from 'components/pagination';
import TransactionsHeader from './transactions-header';
import tableRows from './table-rows';
import SearchCard from 'components/search-card';

const PAGE_SIZE = 10;

class TransactionsTable extends React.Component {
	static displayName = 'TransactionsTable';

	static defaultProps = {
		header: false,
	};

	constructor( props ) {
		super( props );

		if ( props.transactions ) {
			this.state = this.applyFilters( props.transactions, props.initialFilter, 1 );
		} else {
			this.state = {
				filter: props.initialFilter,
				page: 1,
				total: 0,
			};
		}
	}

	onPageClick = page => {
		this.filterTransactions( this.state.filter, page );
	};

	componentWillUpdate() {
		if ( ! this.state.transactions ) {
			// `defer` is necessary to prevent a React.js rendering error. It is
			// not possible to call `this.setState` during `componentWillUpdate`, so
			// we use `defer` to run the update on the next event loop.
			defer( this.filterTransactions.bind( this, this.state.filter, 1 ) );
		}
	}

	applyFilters = ( transactions, filter, page ) => {
		let newFilter;

		if ( ! transactions ) {
			return;
		}

		if ( filter.search ) {
			// In this case the user is typing in the search box. We remove any other
			// filter parameters besides the text we're searching for.
			newFilter = pick( filter, 'search' );
		} else {
			// Otherwise, the user intends to set a new filter. When we do this, we
			// get rid of any data from a previous search.
			newFilter = filter;
		}

		const pageIndex = page - 1;
		const filteredTransactions = tableRows.filter( this.props.transactions, newFilter );
		const newTransactions = slice(
			filteredTransactions,
			pageIndex * PAGE_SIZE,
			pageIndex * PAGE_SIZE + PAGE_SIZE
		);

		return {
			transactions: newTransactions,
			filter: newFilter,
			page,
			total: filteredTransactions.length,
		};
	};

	filterTransactions = ( filter, page ) => {
		this.setState( this.applyFilters( this.props.transactions, filter, page ) );
	};

	onSearch = terms => {
		this.filterTransactions( { search: terms }, 1 );
	};

	render() {
		let header;

		if ( false !== this.props.header ) {
			header = (
				<TransactionsHeader
					onNewFilter={ this.filterTransactions }
					transactions={ this.props.transactions }
					filter={ this.state.filter }
				/>
			);
		}

		return (
			<div>
				<SearchCard
					placeholder={ this.props.translate( 'Search all receipts…', { textOnly: true } ) }
					onSearch={ this.onSearch }
				/>
				<table className="billing-history__transactions">
					{ header }
					<tbody>{ this.renderRows() }</tbody>
				</table>
				{ this.renderPagination() }
			</div>
		);
	}

	serviceName = transaction => {
		var item, name;

		if ( ! transaction.items ) {
			name = this.serviceNameDescription( transaction );
		} else if ( transaction.items.length === 1 ) {
			item = transaction.items[ 0 ];
			item.plan = capitalPDangit( titleCase( item.variation ) );
			name = this.serviceNameDescription( item );
		} else {
			name = <strong>{ this.props.translate( 'Multiple items' ) }</strong>;
		}

		return name;
	};

	serviceNameDescription = transaction => {
		var description;
		if ( transaction.domain ) {
			description = (
				<div>
					<strong>{ transaction.plan }</strong>
					<small>{ transaction.domain }</small>
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
				<td className="date">
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
		if ( this.state.total < PAGE_SIZE ) {
			return null;
		}

		return (
			<CompactCard>
				<Pagination
					page={ this.state.page }
					perPage={ PAGE_SIZE }
					total={ this.state.total }
					pageClick={ this.onPageClick }
				/>
			</CompactCard>
		);
	};

	renderRows = () => {
		if ( ! this.state.transactions ) {
			return this.renderPlaceholder();
		}

		if ( isEmpty( this.state.transactions ) ) {
			let noResultsText;
			if ( this.state.filter !== this.props.initialFilter ) {
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

		return this.state.transactions.map( function( transaction ) {
			var date = tableRows.formatDate( transaction.date );

			return (
				<tr key={ transaction.id } className="billing-history__transaction">
					<td className="date">{ date }</td>
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
					<td className="billing-history__amount">{ transaction.amount }</td>
				</tr>
			);
		}, this );
	};
}

export default localize( TransactionsTable );
