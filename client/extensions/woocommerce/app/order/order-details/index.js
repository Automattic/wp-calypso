/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import OrderCreated from '../order-created';
import OrderFulfillment from '../order-fulfillment';
import OrderPaymentCard from '../order-payment';
import OrderDetailsTable from './table';
import Card from 'components/card';
import SectionHeader from 'components/section-header';
import OrderStatus from 'woocommerce/components/order-status';
import OrderStatusSelect from 'woocommerce/components/order-status/select';
import { isOrderWaitingPayment } from 'woocommerce/lib/order-status';

class OrderDetails extends Component {
	static propTypes = {
		onUpdate: PropTypes.func,
		order: PropTypes.object.isRequired,
		site: PropTypes.shape( {
			ID: PropTypes.number.isRequired,
			slug: PropTypes.string.isRequired,
		} ),
	}

	constructor( props ) {
		super( props );
		this.state = {
			status: this.props.order.status || false,
		};
	}

	updateStatus = ( event ) => {
		this.setState( { status: event.target.value } );
		// Send the order back to the parent component
		this.props.onUpdate( { status: event.target.value } );
	}

	renderStatus = () => {
		const { order } = this.props;

		return isOrderWaitingPayment( order.status )
			? <OrderStatusSelect value={ this.state.status } onChange={ this.updateStatus } />
			: <OrderStatus status={ order.status } showShipping={ false } />;
	}

	render() {
		const { order, site, translate } = this.props;
		if ( ! order ) {
			return null;
		}

		return (
			<div className="order-details">
				<SectionHeader label={ translate( 'Order %(orderId)s Details', { args: { orderId: `#${ order.id }` } } ) }>
					<span>{ this.renderStatus() }</span>
				</SectionHeader>
				<Card className="order-details__card">
					<OrderCreated order={ order } site={ site } />
					<OrderDetailsTable order={ order } site={ site } />
					<OrderPaymentCard order={ order } site={ site } />
					<OrderFulfillment order={ order } site={ site } />
				</Card>
			</div>
		);
	}
}

export default localize( OrderDetails );
