/**
 * External dependencies
 */
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';
import { times } from 'lodash';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FormInputCheckbox from 'components/forms/form-checkbox';
import { fetchOrders } from 'woocommerce/state/sites/orders/actions';
import { setCurrentPage } from 'woocommerce/state/ui/orders/actions';
import {
	areOrdersLoading,
	areOrdersLoaded,
	getOrders,
	getTotalOrdersPages
} from 'woocommerce/state/sites/orders/selectors';
import { getOrdersCurrentPage } from 'woocommerce/state/ui/orders/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import Table from 'woocommerce/components/table';
import TableRow from 'woocommerce/components/table/table-row';
import TableItem from 'woocommerce/components/table/table-item';

class Orders extends Component {
	componentDidMount() {
		const { siteId, currentPage } = this.props;

		if ( siteId ) {
			this.props.fetchOrders( siteId, currentPage );
		}
	}

	componentWillReceiveProps( newProps ) {
		if ( newProps.currentPage !== this.props.currentPage || newProps.siteId !== this.props.siteId ) {
			this.props.fetchOrders( newProps.siteId, newProps.currentPage );
		}
	}

	getOrderStatus = ( status ) => {
		const { translate } = this.props;
		const classes = `orders__item-status is-${ status }`;
		switch ( status ) {
			case 'pending':
				return <span className={ classes }>{ translate( 'Pending payment' ) }</span>;
			case 'processing':
				return <span className={ classes }>{ translate( 'Processing' ) }</span>;
			case 'on-hold':
				return <span className={ classes }>{ translate( 'On hold' ) }</span>;
			case 'completed':
				return <span className={ classes }>{ translate( 'Completed' ) }</span>;
			case 'cancelled':
				return <span className={ classes }>{ translate( 'Cancelled' ) }</span>;
			case 'refunded':
				return <span className={ classes }>{ translate( 'Refunded' ) }</span>;
			case 'failed':
				return <span className={ classes }>{ translate( 'Failed' ) }</span>;
		}
	}

	renderOrderItems = ( order, i ) => {
		const { translate, moment, siteId } = this.props;
		return (
			<TableRow key={ i }>
				<TableItem className="orders__table-checkbox">
					<FormInputCheckbox aria-label={ translate( 'Select order %(order)s', {
						context: 'Label for checkbox',
						args: {
							order: order.number,
						}
					} ) } />
				</TableItem>
				<TableItem className="orders__table-name" isRowHeader>
					<a className="orders__item-link" href={ `/store/order/${ siteId }/${ order.number }` }>#{ order.number }</a>
					<span className="orders__item-name">
						{ `${ order.billing.first_name } ${ order.billing.last_name }` }
					</span>
				</TableItem>
				<TableItem className="orders__table-date">
					{ moment( order.date_modified ).format( 'LLL' ) }
				</TableItem>
				<TableItem className="orders__table-status">
					{ this.getOrderStatus( order.status ) }
				</TableItem>
				<TableItem className="orders__table-total">
					{ order.total }
				</TableItem>
			</TableRow>
		);
	}

	onPageClick = ( i ) => {
		return () => {
			this.props.setCurrentPage( this.props.siteId, i );
		};
	}

	renderPageLink = ( i ) => {
		// We want this to start at 1, not 0
		i++;
		return (
			<li key={ i }>
				{ ( i !== this.props.currentPage )
					? <Button compact borderless onClick={ this.onPageClick( i ) }>{ i }</Button>
					: <span>{ i }</span>
				}
			</li>
		);
	}

	renderPagination = () => {
		const { totalPages } = this.props;
		if ( totalPages < 2 ) {
			return null;
		}

		return (
			<ul>
				{ times( totalPages, this.renderPageLink ) }
			</ul>
		);
	}

	render() {
		const { orders, ordersLoading, ordersLoaded, translate } = this.props;
		const headers = (
			<TableRow>
				<TableItem isHeader>
					<FormInputCheckbox aria-label={ translate( 'Select All', {
						context: 'Label for checkbox'
					} ) } />
				</TableItem>
				<TableItem isHeader>{ translate( 'Order' ) }</TableItem>
				<TableItem isHeader>{ translate( 'Date' ) }</TableItem>
				<TableItem isHeader>{ translate( 'Status' ) }</TableItem>
				<TableItem isHeader>{ translate( 'Total' ) }</TableItem>
			</TableRow>
		);

		// @todo Designer needed :)
		const placeholder = ( ordersLoading && ! ordersLoaded ) ? translate( 'Loading orders' ) : translate( 'No orders found.' );

		return (
			<div>
				<Table className="orders__table" header={ headers }>
					{ orders.length
						? orders.map( this.renderOrderItems )
						: <TableRow><TableItem colSpan="5">{ placeholder }</TableItem></TableRow>
					}
				</Table>
				{ this.renderPagination() }
			</div>
		);
	}
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );
		const currentPage = getOrdersCurrentPage( state, siteId );
		const orders = getOrders( state, currentPage, siteId );
		const ordersLoading = areOrdersLoading( state, currentPage, siteId );
		const ordersLoaded = areOrdersLoaded( state, currentPage, siteId );
		const totalPages = getTotalOrdersPages( state, siteId );

		return {
			currentPage,
			orders,
			ordersLoading,
			ordersLoaded,
			siteId,
			totalPages,
		};
	},
	dispatch => bindActionCreators( { fetchOrders, setCurrentPage }, dispatch )
)( localize( Orders ) );
