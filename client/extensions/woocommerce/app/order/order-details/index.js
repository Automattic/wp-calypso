/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import config from 'config';
import { isOrderWaitingPayment } from 'woocommerce/lib/order-status';
import OrderCreated from '../order-created';
import OrderDetailsTable from './table';
import OrderFulfillment from '../order-fulfillment';
import OrderRefundCard from '../order-refund';
import OrderStatus from 'woocommerce/components/order-status';
import OrderStatusSelect from 'woocommerce/components/order-status/select';
import SectionHeader from 'components/section-header';
import ShippingLabel from 'woocommerce/woocommerce-services/views/shipping-label';

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

		const wcsEnabled = config.isEnabled( 'woocommerce/extension-wcservices' );

		return (
			<div className="order-details">
				<SectionHeader label={ translate( 'Order %(orderId)s Details', { args: { orderId: `#${ order.id }` } } ) }>
					<span>{ this.renderStatus() }</span>
				</SectionHeader>
				<Card className="order-details__card">
					<OrderCreated order={ order } site={ site } />
					<OrderDetailsTable order={ order } site={ site } />
					<OrderRefundCard order={ order } site={ site } />
					<OrderFulfillment order={ order } site={ site } />
					{ wcsEnabled && <ShippingLabel siteId={ site.ID } orderId={ order.id } /> }
				</Card>
			</div>
		);
	}
}

export default localize( OrderDetails );
