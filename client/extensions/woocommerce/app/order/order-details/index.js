/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { isObject } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Card } from '@automattic/components';
import { editOrder } from 'woocommerce/state/ui/orders/actions';
import { isCurrentlyEditingOrder, getOrderWithEdits } from 'woocommerce/state/ui/orders/selectors';
import { isOrderEditable } from 'woocommerce/lib/order-status';
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
		orderId: PropTypes.oneOfType( [
			PropTypes.number, // A number indicates an existing order
			PropTypes.shape( { id: PropTypes.string } ), // Placeholders have format { id: 'order_1' }
		] ).isRequired,
	};

	constructor( props ) {
		super( props );
		this.state = {
			status: this.props.order.status || false,
		};
	}

	updateStatus = ( event ) => {
		const { siteId, order } = this.props;
		if ( siteId ) {
			this.props.editOrder( siteId, { id: order.id, status: event.target.value } );
		}
	};

	updateOrder = ( newOrder ) => {
		const { siteId, order } = this.props;
		if ( siteId ) {
			this.props.editOrder( siteId, { id: order.id, ...newOrder } );
		}
	};

	renderStatus = () => {
		const { isEditing, order } = this.props;

		return isEditing ? (
			<OrderStatusSelect value={ order.status } onChange={ this.updateStatus } />
		) : (
			<OrderStatus order={ order } showShipping={ false } />
		);
	};

	renderDetails = () => {
		const { isEditing, order, site } = this.props;
		if ( isEditing ) {
			return (
				<OrderDetailsTable
					order={ order }
					site={ site }
					isEditing={ isOrderEditable( order ) }
					onChange={ this.updateOrder }
				/>
			);
		}

		return [
			<OrderCreated key="order-date" order={ order } site={ site } />,
			<OrderDetailsTable key="order-details" order={ order } site={ site } />,
			<OrderPaymentCard key="order-payment" order={ order } siteId={ site.ID || null } />,
			<OrderFulfillment key="order-fulfillment" order={ order } site={ site } />,
		];
	};

	render() {
		const { order, translate } = this.props;
		if ( ! order ) {
			return null;
		}

		return (
			<div className="order-details">
				<SectionHeader
					label={ translate( 'Order %(orderId)s details', {
						args: { orderId: isObject( order.id ) ? '' : `#${ order.id }` },
					} ) }
				>
					<span>{ this.renderStatus() }</span>
				</SectionHeader>
				<Card className="order-details__card">{ this.renderDetails() }</Card>
			</div>
		);
	}
}

export default connect(
	( state, props ) => {
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
	},
	( dispatch ) => bindActionCreators( { editOrder }, dispatch )
)( localize( OrderDetails ) );
