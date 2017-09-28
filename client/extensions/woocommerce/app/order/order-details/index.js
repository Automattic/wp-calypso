/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import { isCurrentlyEditingOrder, getOrderWithEdits } from 'woocommerce/state/ui/orders/selectors';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { getOrder } from 'woocommerce/state/sites/orders/selectors';
import OrderCreated from '../order-created';
import OrderDetailsTable from './table';
import OrderFulfillment from '../order-fulfillment';
import OrderPaymentCard from '../order-payment';
import OrderStatus from 'woocommerce/components/order-status';
import OrderStatusSelect from 'woocommerce/components/order-status/select';
import SectionHeader from 'components/section-header';

class OrderDetails extends Component {
	static propTypes = {
		orderId: PropTypes.number.isRequired,
	};

	constructor( props ) {
		super( props );
		this.state = {
			status: this.props.order.status || false,
		};
	}

	updateStatus = event => {
		const { siteId } = this.props;
		if ( siteId ) {
			this.props.editOrder( siteId, { status: event.target.value } );
		}
	};

	renderStatus = () => {
		const { isEditing, order } = this.props;

		return isEditing ? (
			<OrderStatusSelect value={ this.state.status } onChange={ this.updateStatus } />
		) : (
			<OrderStatus status={ order.status } showShipping={ false } />
		);
	};

	render() {
		const { isEditing, order, site, translate } = this.props;
		if ( ! order ) {
			return null;
		}

		return (
			<div className="order-details">
				<SectionHeader
					label={ translate( 'Order %(orderId)s Details', {
						args: { orderId: `#${ order.id }` },
					} ) }
				>
					<span>{ this.renderStatus() }</span>
				</SectionHeader>
				<Card className="order-details__card">
					{ ! isEditing && <OrderCreated order={ order } site={ site } /> }
					<OrderDetailsTable order={ order } site={ site } />
					{ ! isEditing && <OrderPaymentCard order={ order } site={ site } /> }
					{ ! isEditing && <OrderFulfillment order={ order } site={ site } /> }
				</Card>
			</div>
		);
	}
}

export default connect( ( state, props ) => {
	const site = getSelectedSiteWithFallback( state );
	const siteId = site ? site.ID : false;
	const isEditing = isCurrentlyEditingOrder( state );
	const order = isEditing ? getOrderWithEdits( state ) : getOrder( state, props.orderId );

	return {
		isEditing,
		order,
		site,
		siteId,
	};
} )( localize( OrderDetails ) );
