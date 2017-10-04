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
import { fetchNotes } from 'woocommerce/state/sites/orders/notes/actions';
import { fetchOrder } from 'woocommerce/state/sites/orders/actions';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { getLink } from 'woocommerce/lib/nav-utils';
import {
	isCurrentlyEditingOrder,
	getOrderEdits,
	getOrderWithEdits,
} from 'woocommerce/state/ui/orders/selectors';
import { isOrderUpdating, getOrder } from 'woocommerce/state/sites/orders/selectors';
import Main from 'components/main';
import OrderCustomer from './order-customer';
import OrderDetails from './order-details';
import OrderNotes from './order-notes';
import { updateOrder } from 'woocommerce/state/sites/orders/actions';

class Order extends Component {
	componentDidMount() {
		const { siteId, orderId } = this.props;

		if ( siteId ) {
			this.props.fetchOrder( siteId, orderId );
			this.props.fetchNotes( siteId, orderId );
		}
	}

	componentWillReceiveProps( newProps ) {
		if ( newProps.orderId !== this.props.orderId || newProps.siteId !== this.props.siteId ) {
			// New order or site should clear any pending edits
			this.props.clearOrderEdits( this.props.siteId );
			// And fetch the new order's info
			this.props.fetchOrder( newProps.siteId, newProps.orderId );
			this.props.fetchNotes( newProps.siteId, newProps.orderId );
		} else if (
			newProps.order &&
			this.props.order &&
			newProps.order.status !== this.props.order.status
		) {
			// A status change should force a notes refresh
			this.props.fetchNotes( newProps.siteId, newProps.orderId, true );
		}
	}

	componentWillUnmount() {
		// Removing this component should clear any pending edits
		this.props.clearOrderEdits( this.props.siteId );
	}

	// Put this order into the editing state
	toggleEditing = () => {
		const { siteId, orderId } = this.props;
		if ( siteId ) {
			this.props.editOrder( siteId, { id: orderId } );
		}
	};

	// Clear this order's edits, takes it out of edit state
	cancelEditing = () => {
		const { siteId } = this.props;
		this.props.clearOrderEdits( siteId );
	};

	// Saves changes to the remote site via API
	saveOrder = () => {
		const { siteId, order } = this.props;
		this.props.updateOrder( siteId, order );
		this.props.clearOrderEdits( siteId );
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
				disabled={ ! hasOrderEdits }
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
			<Main className={ className }>
				<ActionHeader breadcrumbs={ breadcrumbs }>
					{ config.isEnabled( 'woocommerce/extension-orders-create' ) && button }
				</ActionHeader>

				<div className="order__container">
					<OrderDetails orderId={ orderId } />
					<OrderNotes orderId={ orderId } siteId={ site.ID } />
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
			{ clearOrderEdits, editOrder, fetchNotes, fetchOrder, updateOrder },
			dispatch
		)
)( localize( Order ) );
