/**
 * External dependencies
 */
var React = require( 'react' ),
	defer = require( 'lodash/defer' ),
	pick = require( 'lodash/pick' ),
	isEmpty = require( 'lodash/isEmpty' ),
	titleCase = require( 'to-title-case' ),
	capitalPDangit = require( 'lib/formatting' ).capitalPDangit;

/**
 * Internal dependencies
 */
var TransactionsHeader = require( './transactions-header' ),
	tableRows = require( './table-rows' );

import SearchCard from 'components/search-card';

var TransactionsTable = React.createClass( {
	displayName: 'TransactionsTable',

	getInitialState: function() {
		var initialTransactions;

		if ( this.props.transactions ) {
			initialTransactions = tableRows.filter( this.props.transactions, this.props.initialFilter );
		}

		return {
			transactions: initialTransactions,
			filter: this.props.initialFilter
		};
	},

	getDefaultProps: function() {
		return {
			header: false
		};
	},

	componentWillUpdate: function() {
		if ( ! this.state.transactions ) {
			// `defer` is necessary to prevent a React.js rendering error. It is
			// not possible to call `this.setState` during `componentWillUpdate`, so
			// we use `defer` to run the update on the next event loop.
			defer( this.filterTransactions.bind( this, this.state.filter ) );
		}
	},

	filterTransactions: function( filter ) {
		var newFilter, newTransactions;

		if ( ! this.props.transactions ) {
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

		newTransactions = tableRows.filter( this.props.transactions, newFilter );

		this.setState( {
			transactions: newTransactions,
			filter: newFilter
		} );
	},

	onSearch: function( terms ) {
		this.filterTransactions( { search: terms } );
	},

	render: function() {
		var header;

		if ( false !== this.props.header ) {
			header = <TransactionsHeader
				onNewFilter={ this.filterTransactions }
				transactions={ this.props.transactions }
				filter={ this.state.filter } />;
		}

		return (
			<div>
				<SearchCard
					placeholder={ this.translate( 'Search all receipts…', { textOnly: true } ) }
					onSearch={ this.onSearch }
				/>
				<table className="billing-history__transactions">
					{ header }
					<tbody>{ this.renderRows() }</tbody>
				</table>
			</div>
		);
	},

	serviceName: function( transaction ) {
		var item,
			name;

		if ( ! transaction.items ) {
			name = this.serviceNameDescription( transaction );
		} else if ( transaction.items.length === 1 ) {
			item = transaction.items[ 0 ];
			item.plan = capitalPDangit( titleCase( item.variation ) );
			name = this.serviceNameDescription( item );
		} else {
			name = <strong>{ this.translate( 'Multiple items' ) }</strong>;
		}

		return name;
	},

	serviceNameDescription: function( transaction ) {
		var description;
		if ( transaction.domain ) {
			description = (
				<div>
					<strong>{ transaction.plan }</strong>
					<small>{ transaction.domain }</small>
				</div>
			);
		} else {
			description = <strong>{ transaction.product } { transaction.plan }</strong>;
		}

		return description;
	},

	renderPlaceholder() {
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
	},

	renderRows: function() {
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
					<td className="billing-history__no-results-cell" colSpan="3">{ noResultsText }</td>
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
								<div className="billing-history__service-name">{ this.serviceName( transaction ) }</div>
								{ this.props.transactionRenderer.call( this, transaction ) }
							</div>
						</div>
					</td>
					<td className="billing-history__amount">{ transaction.amount }</td>
				</tr>
			);
		}, this );
	}
} );

module.exports = TransactionsTable;
