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
import EmptyContent from 'components/empty-content';
import { fetchOrders } from 'woocommerce/state/sites/orders/actions';
import formatCurrency from 'lib/format-currency';
import {
	areOrdersLoading,
	areOrdersLoaded,
	getOrders,
	getTotalOrdersPages
} from 'woocommerce/state/sites/orders/selectors';
import { getLink } from 'woocommerce/lib/nav-utils';
import { getOrdersCurrentPage } from 'woocommerce/state/ui/orders/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { getSiteAdminUrl } from 'state/sites/selectors';
import humanDate from 'lib/human-date';
import { setCurrentPage } from 'woocommerce/state/ui/orders/actions';
import NavItem from 'components/section-nav/item';
import NavTabs from 'components/section-nav/tabs';
import SectionNav from 'components/section-nav';
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

	renderOrderItems = ( order, i ) => {
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
					{ humanDate( order.date_created ) }
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
		// @todo Bring back pagination
		if ( true || totalPages < 2 ) {
			return null;
		}

		return (
			<ul>
				{ times( totalPages, this.renderPageLink ) }
			</ul>
		);
	}

	render() {
		const { createOrderLink, orders, translate } = this.props;
		if ( ! orders.length ) {
			return (
				<div className="orders__container">
					<EmptyContent
						title={ translate( 'Your orders will appear here as they come in.' ) }
						action={ translate( 'Manually add an order' ) }
						actionURL={ createOrderLink } />
				</div>
			);
		}

		const headers = (
			<TableRow>
				<TableItem className="orders__table-name" isHeader>{ translate( 'Order' ) }</TableItem>
				<TableItem className="orders__table-date" isHeader>{ translate( 'Date' ) }</TableItem>
				<TableItem className="orders__table-status" isHeader>{ translate( 'Status' ) }</TableItem>
				<TableItem className="orders__table-total" isHeader>{ translate( 'Total' ) }</TableItem>
			</TableRow>
		);

		return (
			<div className="orders__container">
				<SectionNav>
					<NavTabs label={ translate( 'Status' ) } selectedText={ translate( 'All orders' ) }>
						<NavItem path="/orders" selected={ true }>{ translate( 'All orders' ) }</NavItem>
					</NavTabs>
				</SectionNav>

				<Table className="orders__table" header={ headers } horizontalScroll>
					{ orders.map( this.renderOrderItems ) }
				</Table>
				{ this.renderPagination() }
			</div>
		);
	}
}

export default connect(
	state => {
		const site = getSelectedSiteWithFallback( state );
		const siteId = site ? site.ID : false;
		const createOrderLink = getSiteAdminUrl( state, siteId, 'post-new.php?post_type=shop_order' );
		const currentPage = getOrdersCurrentPage( state, siteId );
		const orders = getOrders( state, currentPage, siteId );
		const ordersLoading = areOrdersLoading( state, currentPage, siteId );
		const ordersLoaded = areOrdersLoaded( state, currentPage, siteId );
		const totalPages = getTotalOrdersPages( state, siteId );

		return {
			createOrderLink,
			currentPage,
			orders,
			ordersLoading,
			ordersLoaded,
			site,
			siteId,
			totalPages,
		};
	},
	dispatch => bindActionCreators( { fetchOrders, setCurrentPage }, dispatch )
)( localize( Orders ) );
