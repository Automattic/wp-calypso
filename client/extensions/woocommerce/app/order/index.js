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
import { isCurrentlyEditingOrder, getOrderWithEdits } from 'woocommerce/state/ui/orders/selectors';
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

	// Put this order into the editing state
	toggleEditing = () => {
		const { siteId, orderId } = this.props;
		if ( siteId ) {
			this.props.editOrder( siteId, { id: orderId } );
		}
	};

	// Saves changes to the remote site via API
	saveOrder = () => {
		const { siteId } = this.props;
		// this.props.updateOrder( siteId, order );
		this.props.clearOrderEdits( siteId );
	};

	render() {
		const { className, isEditing, isSaving, order, orderId, site, translate } = this.props;
		if ( isEmpty( order ) ) {
			return null;
		}

		const breadcrumbs = [
			<a href={ getLink( '/store/orders/:site/', site ) }>{ translate( 'Orders' ) }</a>,
			<span>
				{ translate( 'Order %(orderId)s Details', { args: { orderId: `#${ orderId }` } } ) }
			</span>,
		];

		let button = (
			<Button primary onClick={ this.saveOrder } busy={ isSaving }>
				{ translate( 'Save Order' ) }
			</Button>
		);
		if ( ! isEditing && config.isEnabled( 'woocommerce/extension-orders-create' ) ) {
			button = (
				<Button primary onClick={ this.toggleEditing }>
					{ translate( 'Edit Order' ) }
				</Button>
			);
		}

		return (
			<Main className={ className }>
				<ActionHeader breadcrumbs={ breadcrumbs }>{ button }</ActionHeader>

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
		const order = isEditing ? getOrderWithEdits( state ) : getOrder( state, orderId );

		return {
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
