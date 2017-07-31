/**
 * External dependencies
 */
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import { range } from 'lodash';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import { fetchOrders } from 'woocommerce/state/sites/orders/actions';
import formatCurrency from 'lib/format-currency';
import {
	areOrdersLoading,
	areOrdersLoaded,
	getOrders,
	getTotalOrders
} from 'woocommerce/state/sites/orders/selectors';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getOrdersCurrentPage, getOrdersCurrentSearch } from 'woocommerce/state/ui/orders/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import humanDate from 'lib/human-date';
import { updateCurrentOrdersQuery } from 'woocommerce/state/ui/orders/actions';
import OrdersFilterNav from './orders-filter-nav';
import Pagination from 'components/pagination';
import Table from 'woocommerce/components/table';
import TableRow from 'woocommerce/components/table/table-row';
import TableItem from 'woocommerce/components/table/table-item';

class Orders extends Component {
	componentDidMount() {
		const { siteId, currentStatus } = this.props;
		const query = {
			page: 1,
			search: '',
			status: currentStatus,
		};
		this.props.updateCurrentOrdersQuery( this.props.siteId, { page: 1, search: '' } );
		if ( siteId ) {
			this.props.fetchOrders( siteId, query );
		}
	}

	componentWillReceiveProps( newProps ) {
		const hasAnythingChanged = (
			newProps.currentPage !== this.props.currentPage ||
			newProps.currentSearch !== this.props.currentSearch ||
			newProps.currentStatus !== this.props.currentStatus ||
			newProps.siteId !== this.props.siteId
		);
		if ( ! newProps.siteId || ! hasAnythingChanged ) {
			return;
		}

		const query = {
			page: newProps.currentPage,
			search: newProps.currentSearch,
			status: newProps.currentStatus,
		};
		if ( newProps.currentSearch !== this.props.currentSearch ) {
			this.props.updateCurrentOrdersQuery( this.props.siteId, { page: 1 } );
			query.page = 1;
		} else if ( newProps.currentStatus !== this.props.currentStatus ) {
			this.props.updateCurrentOrdersQuery( this.props.siteId, { page: 1, search: '' } );
			query.page = 1;
			query.search = '';
		}
		this.props.fetchOrders( newProps.siteId, query );
	}

	clearSearch = ( event ) => {
		const { site, siteId } = this.props;
		this.search.closeSearch( event );
		this.props.updateCurrentOrdersQuery( siteId, { page: 1, search: '' } );
		page( getLink( '/store/orders/:site', site ) );
	}

	getOrderStatus = ( status ) => {
		const { translate } = this.props;
		const classes = `orders__item-status is-${ status }`;
		let paymentLabel;
		let shippingLabel;
		switch ( status ) {
			case 'pending':
				shippingLabel = translate( 'New order' );
				paymentLabel = translate( 'Payment pending' );
				break;
			case 'processing':
				shippingLabel = translate( 'New order' );
				paymentLabel = translate( 'Paid in full' );
				break;
			case 'on-hold':
				shippingLabel = translate( 'On hold' );
				paymentLabel = translate( 'Payment pending' );
				break;
			case 'completed':
				shippingLabel = translate( 'Fulfilled' );
				paymentLabel = translate( 'Paid in full' );
				break;
			case 'cancelled':
				paymentLabel = translate( 'Cancelled' );
				break;
			case 'refunded':
				paymentLabel = translate( 'Refunded' );
				break;
			case 'failed':
				paymentLabel = translate( 'Payment Failed' );
				break;
		}

		return (
			<span className={ classes }>
				{ shippingLabel ? <span className="orders__shipping-status">{ shippingLabel }</span> : null }
				<span className="orders__payment-status">{ paymentLabel }</span>
			</span>
		);
	}

	renderPlaceholders = () => {
		return range( 5 ).map( ( i ) => {
			return (
				<TableRow key={ i } className="orders__row-placeholder">
					<TableItem className="orders__table-name" isRowHeader><span /></TableItem>
					<TableItem className="orders__table-date"><span /></TableItem>
					<TableItem className="orders__table-status"><span /></TableItem>
					<TableItem className="orders__table-total"><span /></TableItem>
				</TableRow>
			);
		} );
	}

	renderNoContent = () => {
		const { currentSearch, currentStatus, site, translate } = this.props;
		let emptyMessage = translate( 'Your orders will appear here as they come in.' );
		if ( currentSearch ) {
			emptyMessage = translate( 'There are no orders matching your search.' );
		} else if ( 'pending' === currentStatus ) {
			emptyMessage = translate( 'You don\'t have any orders awaiting payment.' );
		} else if ( 'processing' === currentStatus ) {
			emptyMessage = translate( 'You don\'t have any orders awaiting fulfillment.' );
		}

		return (
			<TableRow>
				<TableItem colSpan={ 4 }>
					<EmptyContent
						title={ emptyMessage }
						action={ translate( 'View all orders' ) }
						actionURL={ getLink( '/store/orders/:site', site ) }
						actionCallback={ this.clearSearch }
					/>
				</TableItem>
			</TableRow>
		);
	}

	renderOrderItem = ( order, i ) => {
		const { site } = this.props;
		return (
			<TableRow key={ i } href={ getLink( `/store/order/:site/${ order.number }`, site ) }>
				<TableItem className="orders__table-name" isRowHeader>
					<span className="orders__item-link">#{ order.number }</span>
					<span className="orders__item-name">
						{ `${ order.billing.first_name } ${ order.billing.last_name }` }
					</span>
				</TableItem>
				<TableItem className="orders__table-date">
					{ humanDate( order.date_created_gmt + 'Z' ) }
				</TableItem>
				<TableItem className="orders__table-status">
					{ this.getOrderStatus( order.status ) }
				</TableItem>
				<TableItem className="orders__table-total">
					{ formatCurrency( order.total, order.currency ) || order.total }
				</TableItem>
			</TableRow>
		);
	}

	onPageClick = nextPage => {
		this.props.updateCurrentOrdersQuery( this.props.siteId, {
			page: nextPage,
			status: this.props.currentStatus,
		} );
	}

	render() {
		const {
			currentPage,
			currentStatus,
			isDefaultPage,
			orders,
			ordersLoading,
			ordersLoaded,
			total,
			translate
		} = this.props;

		// Orders are done loading, and there are definitely no orders for this site
		if ( ordersLoaded && ! total && isDefaultPage ) {
			return (
				<div className="orders__container">
					<EmptyContent
						title={ translate( 'Your orders will appear here as they come in.' ) }
					/>
				</div>
			);
		}

		const headers = (
			<TableRow isHeader>
				<TableItem className="orders__table-name" isHeader>{ translate( 'Order' ) }</TableItem>
				<TableItem className="orders__table-date" isHeader>{ translate( 'Date' ) }</TableItem>
				<TableItem className="orders__table-status" isHeader>{ translate( 'Status' ) }</TableItem>
				<TableItem className="orders__table-total" isHeader>{ translate( 'Total' ) }</TableItem>
			</TableRow>
		);

		const ordersList = ( orders && orders.length ) ? orders.map( this.renderOrderItem ) : this.renderNoContent();

		const setSearchRef = ref => this.search = ref;

		return (
			<div className="orders__container">
				<OrdersFilterNav searchRef={ setSearchRef } status={ currentStatus } />

				<Table className="orders__table" header={ headers } horizontalScroll>
					{ ordersLoading
						? this.renderPlaceholders()
						: ordersList }
				</Table>

				<Pagination
					page={ currentPage }
					perPage={ 50 }
					total={ total }
					pageClick={ this.onPageClick }
				/>
			</div>
		);
	}
}

export default connect(
	( state, props ) => {
		const site = getSelectedSiteWithFallback( state );
		const siteId = site ? site.ID : false;
		const currentPage = getOrdersCurrentPage( state, siteId );
		const currentSearch = getOrdersCurrentSearch( state, siteId );
		const currentStatus = props.currentStatus || 'any';

		const isDefaultPage = ( '' === currentSearch && 'any' === currentStatus );

		const query = {
			page: currentPage,
			search: currentSearch,
			status: currentStatus,
		};
		const orders = getOrders( state, query, siteId );
		const ordersLoading = areOrdersLoading( state, query, siteId );
		const ordersLoaded = areOrdersLoaded( state, query, siteId );
		const total = getTotalOrders( state, query, siteId );

		return {
			currentPage,
			currentSearch,
			currentStatus,
			isDefaultPage,
			orders,
			ordersLoading,
			ordersLoaded,
			site,
			siteId,
			total,
		};
	},
	dispatch => bindActionCreators( { fetchOrders, updateCurrentOrdersQuery }, dispatch )
)( localize( Orders ) );
