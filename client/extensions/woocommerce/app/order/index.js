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
import ActionHeader from 'woocommerce/components/action-header';
import Button from 'components/button';
import { fetchOrder } from 'woocommerce/state/sites/orders/actions';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { getLink } from 'woocommerce/lib/nav-utils';
import { isOrderUpdating, getOrder } from 'woocommerce/state/sites/orders/selectors';
import Main from 'components/main';
import OrderCustomer from './order-customer';
import OrderDetails from './order-details';
import { updateOrder } from 'woocommerce/state/sites/orders/actions';

class Order extends Component {
	state = {
		order: {
			id: this.props.orderId,
		}
	}

	componentDidMount() {
		const { siteId, orderId } = this.props;

		if ( siteId ) {
			this.props.fetchOrder( siteId, orderId );
		}
	}

	componentWillReceiveProps( newProps ) {
		if ( newProps.orderId !== this.props.orderId || newProps.siteId !== this.props.siteId ) {
			this.props.fetchOrder( newProps.siteId, newProps.orderId );
		}
	}

	onUpdate = ( order ) => {
		// Merge the new order updates into the existing order updates
		this.setState( ( prevState ) => {
			const updatedOrder = { ...prevState.order, ...order };
			return { order: updatedOrder };
		} );
	}

	saveOrder = () => {
		this.props.updateOrder( this.props.siteId, this.state.order );
	}

	render() {
		const { className, isSaving, order, orderId, site, translate } = this.props;
		if ( ! order ) {
			return null;
		}

		const breadcrumbs = [
			( <a href={ getLink( '/store/orders/:site/', site ) }>{ translate( 'Orders' ) }</a> ),
			( <span>{ translate( 'Order %(orderId)s Details', { args: { orderId: `#${ orderId }` } } ) }</span> ),
		];
		return (
			<Main className={ className }>
				<ActionHeader breadcrumbs={ breadcrumbs }>
					<Button primary onClick={ this.saveOrder } busy={ isSaving }>{ translate( 'Save Order' ) }</Button>
				</ActionHeader>

				<div className="order__container">
					<OrderDetails order={ order } onUpdate={ this.onUpdate } site={ site } />
					<OrderCustomer order={ order } />
				</div>
			</Main>
		);
	}
}

export default connect(
	( state, props ) => {
		const site = getSelectedSiteWithFallback( state );
		const siteId = site ? site.ID : false;
		const orderId = props.params.order;
		const order = getOrder( state, orderId );
		const isSaving = isOrderUpdating( state, orderId );

		return {
			isSaving,
			order,
			orderId,
			site,
			siteId,
		};
	},
	dispatch => bindActionCreators( { fetchOrder, updateOrder }, dispatch )
)( localize( Order ) );
