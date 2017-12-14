/** @format */
/**
 * External dependencies
 */
import { bindActionCreators } from 'redux';
import config from 'config';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import ActionHeader from 'woocommerce/components/action-header';
import Button from 'components/button';
import { clearOrderEdits, editOrder } from 'woocommerce/state/ui/orders/actions';
import { errorNotice, successNotice } from 'state/notices/actions';
import { fetchNotes } from 'woocommerce/state/sites/orders/notes/actions';
import { fetchOrder, saveOrder } from 'woocommerce/state/sites/orders/actions';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { getLink } from 'woocommerce/lib/nav-utils';
import {
	isCurrentlyEditingOrder,
	getOrderEdits,
	getOrderWithEdits,
} from 'woocommerce/state/ui/orders/selectors';
import { isOrderUpdating, getOrder } from 'woocommerce/state/sites/orders/selectors';
import LabelsSetupNotice from 'woocommerce/woocommerce-services/components/labels-setup-notice';
import Main from 'components/main';
import OrderCustomer from './order-customer';
import OrderDetails from './order-details';
import OrderActivityLog from './order-activity-log';
import { ProtectFormGuard } from 'lib/protect-form';
import { recordTrack } from 'woocommerce/lib/analytics';

class Order extends Component {
	componentDidMount() {
		const { siteId, orderId } = this.props;

		if ( siteId ) {
			this.props.fetchOrder( siteId, orderId );
			this.props.fetchNotes( siteId, orderId );
		}
	}

	componentWillReceiveProps( newProps ) {
		const { orderId: oldOrderId, siteId: oldSiteId } = this.props;
		const { orderId: newOrderId, siteId: newSiteId } = newProps;
		if ( newOrderId !== oldOrderId || newSiteId !== oldSiteId ) {
			// New order or site should clear any pending edits
			this.props.clearOrderEdits( oldSiteId );
			// And fetch the new order's info
			this.props.fetchOrder( newSiteId, newOrderId );
			this.props.fetchNotes( newSiteId, newOrderId );
			return;
		}

		if ( this.props.isEditing && ! newProps.isEditing ) {
			// Leaving edit state should re-fetch notes
			this.props.fetchNotes( newSiteId, newOrderId, true );
		}
	}

	componentWillUnmount() {
		// Removing this component should clear any pending edits
		this.props.clearOrderEdits( this.props.siteId );
	}

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
		const onSuccess = dispatch => {
			dispatch( successNotice( translate( 'Order saved.' ), { duration: 5000 } ) );
		};
		const onFailure = dispatch => {
			dispatch( errorNotice( translate( 'Unable to save order.' ), { duration: 5000 } ) );
		};

		recordTrack( 'calypso_woocommerce_order_edit_save' );
		this.props.saveOrder( siteId, order, onSuccess, onFailure );
	};

	render() {
		const {
			className,
			hasOrderEdits,
			isEditing,
			isSaving,
			order,
			orderId,
			site,
			translate,
		} = this.props;
		if ( isEmpty( order ) ) {
			return null;
		}

		const breadcrumbs = [
			<a href={ getLink( '/store/orders/:site/', site ) }>{ translate( 'Orders' ) }</a>,
			<span>
				{ translate( 'Order %(orderId)s Details', { args: { orderId: `#${ orderId }` } } ) }
			</span>,
		];

		let button = [
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
				{ translate( 'Save Order' ) }
			</Button>,
		];
		if ( ! isEditing ) {
			button = (
				<Button primary onClick={ this.toggleEditing }>
					{ translate( 'Edit Order' ) }
				</Button>
			);
		}

		return (
			<Main className={ className } wideLayout>
				<ActionHeader breadcrumbs={ breadcrumbs }>
					{ config.isEnabled( 'woocommerce/extension-orders-edit' ) && button }
				</ActionHeader>

				<div className="order__container">
					<LabelsSetupNotice />
					{ isEditing && <ProtectFormGuard isChanged={ hasOrderEdits } /> }
					<OrderDetails orderId={ orderId } />
					<OrderActivityLog orderId={ orderId } siteId={ site.ID } />
					<OrderCustomer orderId={ orderId } />
				</div>
			</Main>
		);
	}
}

export default connect(
	( state, props ) => {
		const site = getSelectedSiteWithFallback( state );
		const siteId = site ? site.ID : false;
		const orderId = parseInt( props.params.order );
		const isSaving = isOrderUpdating( state, orderId );
		const isEditing = isCurrentlyEditingOrder( state );
		const hasOrderEdits = ! isEmpty( getOrderEdits( state ) );
		const order = isEditing ? getOrderWithEdits( state ) : getOrder( state, orderId );

		return {
			hasOrderEdits,
			isEditing,
			isSaving,
			order,
			orderId,
			site,
			siteId,
		};
	},
	dispatch =>
		bindActionCreators(
			{ clearOrderEdits, editOrder, fetchNotes, fetchOrder, saveOrder },
			dispatch
		)
)( localize( Order ) );
