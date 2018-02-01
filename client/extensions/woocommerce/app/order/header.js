/** @format */
/**
 * External dependencies
 */
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';
import React, { Component, Fragment } from 'react';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import Button from 'components/button';
import { clearOrderEdits, editOrder } from 'woocommerce/state/ui/orders/actions';
import { errorNotice, successNotice } from 'state/notices/actions';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { getLink } from 'woocommerce/lib/nav-utils';
import {
	isCurrentlyEditingOrder,
	getOrderEdits,
	getOrderWithEdits,
} from 'woocommerce/state/ui/orders/selectors';
import {
	isOrderInvoiceSending,
	isOrderUpdating,
	getOrder,
} from 'woocommerce/state/sites/orders/selectors';
import { isOrderWaitingPayment } from 'woocommerce/lib/order-status';
import { recordTrack } from 'woocommerce/lib/analytics';
import { saveOrder } from 'woocommerce/state/sites/orders/actions';
import { sendOrderInvoice } from 'woocommerce/state/sites/orders/send-invoice/actions';

class OrderActionHeader extends Component {
	// Put this order into the editing state
	toggleEditing = () => {
		const { siteId, orderId } = this.props;
		recordTrack( 'calypso_woocommerce_order_edit_start' );
		if ( siteId ) {
			this.props.editOrder( siteId, { id: orderId } );
		}
	};

	// Clear this order's edits, takes it out of edit state
	cancelEditing = () => {
		const { siteId } = this.props;
		recordTrack( 'calypso_woocommerce_order_edit_cancel' );
		this.props.clearOrderEdits( siteId );
	};

	// Saves changes to the remote site via API
	saveOrder = () => {
		const { siteId, order, translate } = this.props;
		const successOpts = { duration: 8000 };
		if ( isOrderWaitingPayment( order.status ) ) {
			successOpts.button = translate( 'Send new invoice to customer' );
			successOpts.onClick = this.triggerInvoice;
		}
		const onSuccess = dispatch => {
			dispatch( successNotice( translate( 'Order successfully updated.' ), successOpts ) );
		};
		const onFailure = dispatch => {
			dispatch( errorNotice( translate( 'Unable to save order.' ), { duration: 8000 } ) );
		};

		recordTrack( 'calypso_woocommerce_order_edit_save' );
		this.props.saveOrder( siteId, order, onSuccess, onFailure );
	};

	triggerInvoice = () => {
		const { siteId, orderId, translate } = this.props;
		if ( siteId && orderId ) {
			const onSuccess = successNotice( translate( 'Order invoice sent.' ), { duration: 8000 } );
			const onFailure = errorNotice( translate( 'Unable to send order invoice.' ), {
				duration: 8000,
			} );

			recordTrack( 'calypso_woocommerce_order_manual_invoice' );
			this.props.sendOrderInvoice( siteId, orderId, onSuccess, onFailure );
		}
	};

	renderViewButtons = () => {
		const { isInvoiceSending, order, translate } = this.props;

		const buttons = [
			<Button key="edit" primary onClick={ this.toggleEditing }>
				{ translate( 'Edit Order' ) }
			</Button>,
		];

		if ( isOrderWaitingPayment( order.status ) ) {
			buttons.unshift(
				<Button
					key="resend-invoice"
					onClick={ this.triggerInvoice }
					busy={ isInvoiceSending }
					disabled={ isInvoiceSending }
				>
					{ translate( 'Resend Invoice' ) }
				</Button>
			);
		}

		return buttons;
	};

	renderEditingButtons = () => {
		const { hasOrderEdits, isSaving, translate } = this.props;
		return (
			<Fragment>
				<Button key="cancel" onClick={ this.cancelEditing }>
					{ translate( 'Cancel' ) }
				</Button>
				<Button
					key="save"
					primary
					onClick={ this.saveOrder }
					busy={ isSaving }
					disabled={ ! hasOrderEdits || isSaving }
				>
					{ translate( 'Update' ) }
				</Button>
			</Fragment>
		);
	};

	render() {
		const { isEditing, orderId, site, translate } = this.props;

		const breadcrumbs = [
			<a href={ getLink( '/store/orders/:site/', site ) }>{ translate( 'Orders' ) }</a>,
			<span>
				{ translate( 'Order %(orderId)s Details', { args: { orderId: `#${ orderId }` } } ) }
			</span>,
		];

		return (
			<ActionHeader breadcrumbs={ breadcrumbs }>
				{ isEditing ? this.renderEditingButtons() : this.renderViewButtons() }
			</ActionHeader>
		);
	}
}

export default connect(
	( state, { orderId } ) => {
		const site = getSelectedSiteWithFallback( state );
		const siteId = site ? site.ID : false;
		const isSaving = isOrderUpdating( state, orderId );
		const isEditing = isCurrentlyEditingOrder( state );
		const isInvoiceSending = isOrderInvoiceSending( state, orderId );
		const hasOrderEdits = ! isEmpty( getOrderEdits( state ) );
		const order = isEditing ? getOrderWithEdits( state ) : getOrder( state, orderId );

		return {
			hasOrderEdits,
			isEditing,
			isInvoiceSending,
			isSaving,
			order,
			orderId,
			site,
			siteId,
		};
	},
	dispatch =>
		bindActionCreators( { clearOrderEdits, editOrder, saveOrder, sendOrderInvoice }, dispatch )
)( localize( OrderActionHeader ) );
