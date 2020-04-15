/**
 * External dependencies
 */
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import page from 'page';
import { range } from 'lodash';
import React, { Component } from 'react';
import formatCurrency from '@automattic/format-currency';

/**
 * Internal dependencies
 */
import EmptyContent from 'components/empty-content';
import { fetchOrders } from 'woocommerce/state/sites/orders/actions';
import {
	areOrdersLoading,
	areOrdersLoaded,
	getOrders,
	getTotalOrders,
} from 'woocommerce/state/sites/orders/selectors';
import { getLink } from 'woocommerce/lib/nav-utils';
import {
	getOrdersCurrentPage,
	getOrdersCurrentSearch,
} from 'woocommerce/state/ui/orders/selectors';
import { getOrderRefundTotal } from 'woocommerce/lib/order-values/totals';
import { getCurrencyFormatDecimal } from 'woocommerce/lib/currency';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import humanDate from 'lib/human-date';
import { ORDER_UNPAID, ORDER_UNFULFILLED, ORDER_COMPLETED } from 'woocommerce/lib/order-status';
import OrdersFilterNav from './orders-filter-nav';
import OrderStatus from 'woocommerce/components/order-status';
import Pagination from 'components/pagination';
import Table from 'woocommerce/components/table';
import TableRow from 'woocommerce/components/table/table-row';
import TableItem from 'woocommerce/components/table/table-item';
import { updateCurrentOrdersQuery } from 'woocommerce/state/ui/orders/actions';

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

	UNSAFE_componentWillReceiveProps( newProps ) {
		const hasAnythingChanged =
			newProps.currentPage !== this.props.currentPage ||
			newProps.currentSearch !== this.props.currentSearch ||
			newProps.currentStatus !== this.props.currentStatus ||
			newProps.siteId !== this.props.siteId;
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
	};

	renderPlaceholders = () => {
		return range( 5 ).map( ( i ) => {
			return (
				<TableRow key={ i } className="orders__row-placeholder">
					<TableItem className="orders__table-name" isRowHeader>
						<span />
					</TableItem>
					<TableItem className="orders__table-date">
						<span />
					</TableItem>
					<TableItem className="orders__table-status">
						<span />
					</TableItem>
					<TableItem className="orders__table-total">
						<span />
					</TableItem>
				</TableRow>
			);
		} );
	};

	renderNoContent = () => {
		const { currentSearch, currentStatus, site, translate } = this.props;
		let emptyMessage = translate( 'Your orders will appear here as they come in.' );
		if ( currentSearch ) {
			emptyMessage = translate( 'There are no orders matching your search.' );
		} else if ( ORDER_UNPAID === currentStatus ) {
			emptyMessage = translate( "You don't have any orders awaiting payment." );
		} else if ( ORDER_UNFULFILLED === currentStatus ) {
			emptyMessage = translate( "You don't have any orders awaiting fulfillment." );
		} else if ( ORDER_COMPLETED === currentStatus ) {
			emptyMessage = translate( "You don't have any completed orders." );
		}

		return (
			<EmptyContent
				title={ emptyMessage }
				action={ translate( 'View all orders' ) }
				actionURL={ getLink( '/store/orders/:site', site ) }
				actionCallback={ this.clearSearch }
			/>
		);
	};

	renderOrderItem = ( order, i ) => {
		const { site } = this.props;
		const total = formatCurrency( order.total, order.currency );
		const refundValue = getOrderRefundTotal( order );
		const remainingTotal = getCurrencyFormatDecimal( order.total, order.currency ) + refundValue;

		return (
			<TableRow
				className={ 'orders__status-' + order.status }
				key={ i }
				href={ getLink( `/store/order/:site/${ order.number }`, site ) }
			>
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
					<OrderStatus order={ order } />
				</TableItem>
				<TableItem className="orders__table-total">
					{ refundValue ? (
						<span>
							<span className="orders__table-old-total">{ total }</span>{ ' ' }
							{ formatCurrency( remainingTotal, order.currency ) }
						</span>
					) : (
						total
					) }
				</TableItem>
			</TableRow>
		);
	};

	renderOrderItems = () => {
		const { orders, ordersLoading, translate } = this.props;

		const headers = (
			<TableRow isHeader>
				<TableItem className="orders__table-name" isHeader>
					{ translate( 'Order', { context: 'Order list table header' } ) }
				</TableItem>
				<TableItem className="orders__table-date" isHeader>
					{ translate( 'Date' ) }
				</TableItem>
				<TableItem className="orders__table-status" isHeader>
					{ translate( 'Status' ) }
				</TableItem>
				<TableItem className="orders__table-total" isHeader>
					{ translate( 'Total' ) }
				</TableItem>
			</TableRow>
		);

		return (
			<Table className="orders__table" header={ headers } horizontalScroll>
				{ ordersLoading ? this.renderPlaceholders() : orders.map( this.renderOrderItem ) }
			</Table>
		);
	};

	onPageClick = ( nextPage ) => {
		this.props.updateCurrentOrdersQuery( this.props.siteId, {
			page: nextPage,
			status: this.props.currentStatus,
		} );
	};

	render() {
		const {
			currentPage,
			currentStatus,
			isDefaultPage,
			orders,
			ordersLoaded,
			total,
			translate,
		} = this.props;

		// Orders are done loading, and there are definitely no orders for this site
		if ( ordersLoaded && ! total && isDefaultPage ) {
			return (
				<div className="orders__container">
					<EmptyContent title={ translate( 'Your orders will appear here as they come in.' ) } />
				</div>
			);
		}

		const setSearchRef = ( ref ) => ( this.search = ref );

		return (
			<div className="orders__container">
				<OrdersFilterNav searchRef={ setSearchRef } status={ currentStatus } />

				{ ! ordersLoaded || ( orders && orders.length )
					? this.renderOrderItems()
					: this.renderNoContent() }

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

		const isDefaultPage = '' === currentSearch && 'any' === currentStatus;

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
	( dispatch ) => bindActionCreators( { fetchOrders, updateCurrentOrdersQuery }, dispatch )
)( localize( Orders ) );
