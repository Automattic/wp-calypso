/** @format */
/**
 * External dependencies
 */
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { get, isEmpty, noop } from 'lodash';
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';
import page from 'page';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import Button from 'components/button';
import { clearOrderEdits, editOrder } from 'woocommerce/state/ui/orders/actions';
import { saveOrder } from 'woocommerce/state/sites/orders/actions';
import { errorNotice, successNotice } from 'state/notices/actions';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { getLink } from 'woocommerce/lib/nav-utils';
import {
	getCurrentlyEditingOrderId,
	getOrderEdits,
	getOrderWithEdits,
} from 'woocommerce/state/ui/orders/selectors';
import { isOrderUpdating } from 'woocommerce/state/sites/orders/selectors';
import { isOrderWaitingPayment } from 'woocommerce/lib/order-status';
import Main from 'components/main';
import OrderCustomerCreate from './order-customer/create';
import OrderDetails from './order-details';
import { ProtectFormGuard } from 'lib/protect-form';
import { recordTrack } from 'woocommerce/lib/analytics';
import { sendOrderInvoice } from 'woocommerce/state/sites/orders/send-invoice/actions';

class Order extends Component {
	componentDidMount() {
		const { siteId } = this.props;

		if ( siteId ) {
			this.props.editOrder( siteId, {} );
		}
	}

	componentWillReceiveProps( newProps ) {
		if ( this.props.siteId !== newProps.siteId ) {
			this.props.editOrder( newProps.siteId, {} );
		}
	}

	componentWillUnmount() {
		// Removing this component should clear any pending edits
		this.props.clearOrderEdits( this.props.siteId );
	}

	triggerInvoice = ( siteId, orderId ) => {
		const { translate } = this.props;
		const onSuccess = dispatch => {
			dispatch(
				successNotice( translate( 'An invoice has been sent to the customer.' ), {
					duration: 8000,
				} )
			);
		};

		this.props.sendOrderInvoice( siteId, orderId, onSuccess, noop );
	};

	// Saves changes to the remote site via API
	saveOrder = () => {
		const { site, siteId, order, translate } = this.props;
		const onSuccess = ( dispatch, orderId ) => {
			const successOpts = {
				duration: 8000,
				displayOnNextPage: true,
			};
			dispatch(
				successNotice(
					translate( 'Order successfully created. {{ordersLink}}View all orders{{/ordersLink}}.', {
						components: {
							ordersLink: <a href={ getLink( '/store/orders/:site/', site ) } />,
						},
					} ),
					successOpts
				)
			);
			// Send invoice if the order is awaiting payment and there is an email
			if ( isOrderWaitingPayment( order.status ) && get( order, 'billing.email', false ) ) {
				this.triggerInvoice( siteId, orderId );
			}
			page.redirect( getLink( `/store/order/:site/${ orderId }`, site ) );
		};
		const onFailure = dispatch => {
			dispatch( errorNotice( translate( 'Unable to create order.' ), { duration: 8000 } ) );
		};

		recordTrack( 'calypso_woocommerce_order_create' );
		this.props.saveOrder( siteId, order, onSuccess, onFailure );
	};

	render() {
		const { className, hasOrderEdits, isSaving, orderId, site, translate } = this.props;
		if ( ! orderId ) {
			return null;
		}

		const breadcrumbs = [
			<a href={ getLink( '/store/orders/:site/', site ) }>{ translate( 'Orders' ) }</a>,
			<span>{ translate( 'New Order' ) }</span>,
		];

		return (
			<Main className={ className } wideLayout>
				<ActionHeader breadcrumbs={ breadcrumbs }>
					<Button
						key="save"
						primary
						onClick={ this.saveOrder }
						busy={ isSaving }
						disabled={ ! hasOrderEdits || isSaving }
					>
						{ translate( 'Save Order' ) }
					</Button>
				</ActionHeader>

				<div className="order__container">
					<ProtectFormGuard isChanged={ hasOrderEdits } />
					<OrderDetails orderId={ orderId } />
					<OrderCustomerCreate orderId={ orderId } />
				</div>
			</Main>
		);
	}
}

export default connect(
	state => {
		const site = getSelectedSiteWithFallback( state );
		const siteId = site ? site.ID : false;
		const orderId = getCurrentlyEditingOrderId( state );
		const isSaving = isOrderUpdating( state, orderId );
		const hasOrderEdits = ! isEmpty( getOrderEdits( state ) );
		const order = getOrderWithEdits( state );

		return {
			hasOrderEdits,
			isSaving,
			order,
			orderId,
			site,
			siteId,
		};
	},
	dispatch =>
		bindActionCreators( { clearOrderEdits, editOrder, saveOrder, sendOrderInvoice }, dispatch )
)( localize( Order ) );
