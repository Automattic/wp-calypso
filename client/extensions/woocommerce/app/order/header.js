/**
 * External dependencies
 */
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Gridicon from 'components/gridicon';
import { isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import accept from 'lib/accept';
import ActionHeader from 'woocommerce/components/action-header';
import { Button } from '@automattic/components';
import { clearOrderEdits, editOrder } from 'woocommerce/state/ui/orders/actions';
import { deleteOrder, saveOrder } from 'woocommerce/state/sites/orders/actions';
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
import { sendOrderInvoice } from 'woocommerce/state/sites/orders/send-invoice/actions';

class OrderActionHeader extends Component {
	static propTypes = {
		clearOrderEdits: PropTypes.func.isRequired,
		editOrder: PropTypes.func.isRequired,
		hasOrderEdits: PropTypes.bool,
		isEditing: PropTypes.bool,
		isInvoiceSending: PropTypes.bool,
		isSaving: PropTypes.bool,
		order: PropTypes.object,
		orderId: PropTypes.number.isRequired,
		saveOrder: PropTypes.func.isRequired,
		sendOrderInvoice: PropTypes.func.isRequired,
		site: PropTypes.object,
		siteId: PropTypes.number.isRequired,
		translate: PropTypes.func.isRequired,
	};

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

	deleteOrder = () => {
		const { orderId, site, translate } = this.props;

		const areYouSure = translate( 'Are you sure you want to delete this order?' );
		accept(
			areYouSure,
			( accepted ) => {
				if ( ! accepted ) {
					return;
				}
				this.props.deleteOrder( site, orderId );
			},
			translate( 'Delete' ),
			translate( 'Cancel' ),
			{ isScary: true }
		);
	};

	// Saves changes to the remote site via API
	saveOrder = () => {
		const { siteId, order, translate, site } = this.props;
		const successOpts = { duration: 8000 };
		if ( isOrderWaitingPayment( order.status ) ) {
			successOpts.button = translate( 'Send new invoice to customer' );
			successOpts.onClick = this.triggerInvoice;
		}
		const onSuccess = ( dispatch ) => {
			dispatch(
				successNotice(
					translate( 'Order successfully updated. {{ordersLink}}View all orders{{/ordersLink}}.', {
						components: {
							ordersLink: <a href={ getLink( '/store/orders/:site/', site ) } />,
						},
					} ),
					successOpts
				)
			);
		};
		const onFailure = ( dispatch ) => {
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
				{ translate( 'Edit order' ) }
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
					{ translate( 'Resend invoice' ) }
				</Button>
			);
		}

		// Unshifting so that the Delete is the first action in the row
		buttons.unshift(
			<Button key="delete" borderless scary onClick={ this.deleteOrder }>
				<Gridicon icon="trash" />
				{ translate( 'Delete' ) }
			</Button>
		);

		return buttons;
	};

	renderEditingButtons = () => {
		const { hasOrderEdits, isSaving, translate } = this.props;
		return [
			<Button key="cancel" onClick={ this.cancelEditing }>
				{ translate( 'Cancel' ) }
			</Button>,
			<Button
				key="save"
				primary
				onClick={ this.saveOrder }
				busy={ isSaving }
				disabled={ ! hasOrderEdits || isSaving }
			>
				{ translate( 'Update' ) }
			</Button>,
		];
	};

	render() {
		const { isEditing, orderId, site, translate } = this.props;

		const breadcrumbs = [
			<a href={ getLink( '/store/orders/:site/', site ) }>{ translate( 'Orders' ) }</a>,
			<span>
				{ translate( 'Order %(orderId)s details', { args: { orderId: `#${ orderId }` } } ) }
			</span>,
		];

		const primaryLabel = isEditing ? translate( 'Update' ) : translate( 'Edit order' );

		return (
			<ActionHeader breadcrumbs={ breadcrumbs } primaryLabel={ primaryLabel }>
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
	( dispatch ) =>
		bindActionCreators(
			{ clearOrderEdits, deleteOrder, editOrder, saveOrder, sendOrderInvoice },
			dispatch
		)
)( localize( OrderActionHeader ) );
