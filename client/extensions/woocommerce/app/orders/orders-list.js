/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import FormInputCheckbox from 'components/forms/form-checkbox';
import orders from './orders.json';

class Orders extends Component {
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
		const { translate, moment } = this.props;
		return (
			<tr key={ i }>
				<td className="orders__table-item orders__table-checkbox">
					<FormInputCheckbox aria-label={ translate( 'Select order %(order)s', {
						context: 'Label for checkbox',
						args: {
							order: order.number,
						}
					} ) } />
				</td>
				<th className="orders__table-item orders__table-name" scope="row">
					<a className="orders__item-link" href="#">#{ order.number }</a>
					<span className="orders__item-name">
						{ `${ order.billing.first_name } ${ order.billing.last_name }` }
					</span>
				</th>
				<td className="orders__table-item orders__table-date">
					{ moment( order.date_modified ).format( 'LLL' ) }
				</td>
				<td className="orders__table-item orders__table-status">
					{ this.getOrderStatus( order.status ) }
				</td>
				<td className="orders__table-item orders__table-total">
					{ order.total }
				</td>
			</tr>
		);
	}

	render() {
		const { translate } = this.props;
		return (
			<table className="orders__table">
				<thead>
					<tr>
						<th className="orders__table-heading" scope="col">
							<FormInputCheckbox aria-label={ translate( 'Select All', {
								context: 'Label for checkbox'
							} ) } />
						</th>
						<th className="orders__table-heading" scope="col">Order</th>
						<th className="orders__table-heading" scope="col">Date</th>
						<th className="orders__table-heading" scope="col">Fulfillment Status</th>
						<th className="orders__table-heading" scope="col">Total</th>
					</tr>
				</thead>
				<tbody>
					{ orders.map( this.renderOrderItems ) }
				</tbody>
			</table>
		);
	}
}

export default localize( Orders );
