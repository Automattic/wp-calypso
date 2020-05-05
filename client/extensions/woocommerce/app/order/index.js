/**
 * External dependencies
 */
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import { clearOrderEdits } from 'woocommerce/state/ui/orders/actions';
import { fetchNotes } from 'woocommerce/state/sites/orders/notes/actions';
import { fetchOrder } from 'woocommerce/state/sites/orders/actions';
import { fetchRefunds } from 'woocommerce/state/sites/orders/refunds/actions';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import {
	isCurrentlyEditingOrder,
	getOrderEdits,
	getOrderWithEdits,
} from 'woocommerce/state/ui/orders/selectors';
import { getOrder } from 'woocommerce/state/sites/orders/selectors';
import LabelsSetupNotice from 'woocommerce/woocommerce-services/components/labels-setup-notice';
import Main from 'components/main';
import OrderActionHeader from './header';
import OrderCustomer from './order-customer';
import OrderDetails from './order-details';
import OrderActivityLog from './order-activity-log';
import { ProtectFormGuard } from 'lib/protect-form';

class Order extends Component {
	componentDidMount() {
		const { siteId, orderId } = this.props;

		if ( siteId ) {
			this.props.fetchOrder( siteId, orderId );
			this.props.fetchNotes( siteId, orderId );
			this.props.fetchRefunds( siteId, orderId );
		}
	}

	componentDidUpdate( prevProps ) {
		const { orderId: oldOrderId, siteId: oldSiteId } = prevProps;
		const { orderId: newOrderId, siteId: newSiteId } = this.props;
		if ( newOrderId !== oldOrderId || newSiteId !== oldSiteId ) {
			// New order or site should clear any pending edits
			this.props.clearOrderEdits( oldSiteId );
			// And fetch the new order's info
			this.props.fetchOrder( newSiteId, newOrderId );
			this.props.fetchNotes( newSiteId, newOrderId );
			this.props.fetchRefunds( newSiteId, newOrderId );
			return;
		}

		if ( prevProps.isEditing && ! this.props.isEditing ) {
			// Leaving edit state should re-fetch notes
			this.props.fetchNotes( newSiteId, newOrderId );
		}
	}

	componentWillUnmount() {
		// Removing this component should clear any pending edits
		this.props.clearOrderEdits( this.props.siteId );
	}

	render() {
		const { className, hasOrder, hasOrderEdits, isEditing, orderId, siteId } = this.props;
		if ( ! hasOrder ) {
			return null;
		}

		return (
			<Main className={ className } wideLayout>
				<OrderActionHeader orderId={ orderId } />

				<div className="order__container">
					<LabelsSetupNotice />
					{ isEditing && <ProtectFormGuard isChanged={ hasOrderEdits } /> }
					<OrderDetails orderId={ orderId } />
					<OrderCustomer orderId={ orderId } />
					<OrderActivityLog orderId={ orderId } siteId={ siteId } />
				</div>
			</Main>
		);
	}
}

export default connect(
	( state, props ) => {
		const site = getSelectedSiteWithFallback( state );
		const siteId = site ? site.ID : false;
		const orderId = parseInt( props.params.order_id );
		const isEditing = isCurrentlyEditingOrder( state );
		const order = isEditing ? getOrderWithEdits( state ) : getOrder( state, orderId );
		const hasOrder = ! isEmpty( order );
		const hasOrderEdits = ! isEmpty( getOrderEdits( state ) );

		return {
			hasOrderEdits,
			hasOrder,
			isEditing,
			orderId,
			siteId,
		};
	},
	( dispatch ) =>
		bindActionCreators( { clearOrderEdits, fetchNotes, fetchOrder, fetchRefunds }, dispatch )
)( localize( Order ) );
