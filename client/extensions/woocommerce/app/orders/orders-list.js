/**
 * External dependencies
 */
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import FormInputCheckbox from 'components/forms/form-checkbox';
import { fetchOrders } from 'woocommerce/state/sites/orders/actions';
import { getOrders } from 'woocommerce/state/sites/orders/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import Table from 'woocommerce/components/table';
import TableRow from 'woocommerce/components/table/table-row';
import TableItem from 'woocommerce/components/table/table-item';

class Orders extends Component {
	componentDidMount() {
		const { siteId } = this.props;

		if ( siteId ) {
			this.props.fetchOrders( siteId );
		}
	}

	componentWillReceiveProps( newProps ) {
		if ( newProps.siteId !== this.props.siteId ) {
			this.props.fetchOrders( newProps.siteId );
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

	render() {
		const { translate, orders } = this.props;
		const headers = (
			<TableRow>
				<TableItem isHeader>
					<FormInputCheckbox aria-label={ translate( 'Select All', {
						context: 'Label for checkbox'
					} ) } />
				</TableItem>
				<TableItem isHeader>{ translate( 'Order' ) }</TableItem>
				<TableItem isHeader>{ translate( 'Date' ) }</TableItem>
				<TableItem isHeader>{ translate( 'Fulfillment Status' ) }</TableItem>
				<TableItem isHeader>{ translate( 'Total' ) }</TableItem>
			</TableRow>
		);

		return (
			<Table className="orders__table" header={ headers }>
				{ orders.map( this.renderOrderItems ) }
			</Table>
		);
	}
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );
		const orders = getOrders( state, siteId );

		return {
			siteId,
			orders,
		};
	},
	dispatch => bindActionCreators( { fetchOrders }, dispatch )
)( localize( Orders ) );
