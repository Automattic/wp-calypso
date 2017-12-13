/** @format */
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
import ActionHeader from 'woocommerce/components/action-header';
import Button from 'components/button';
import { clearOrderEdits, editOrder } from 'woocommerce/state/ui/orders/actions';
import { saveOrder } from 'woocommerce/state/sites/orders/actions';
import { getSelectedSiteWithFallback } from 'woocommerce/state/sites/selectors';
import { getLink } from 'woocommerce/lib/nav-utils';
import {
	getCurrentlyEditingOrderId,
	getOrderEdits,
	getOrderWithEdits,
} from 'woocommerce/state/ui/orders/selectors';
import { isOrderUpdating } from 'woocommerce/state/sites/orders/selectors';
import Main from 'components/main';
import OrderCustomerCreate from './order-customer/create';
import OrderDetails from './order-details';
import { ProtectFormGuard } from 'lib/protect-form';

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

	// Saves changes to the remote site via API
	saveOrder = () => {
		const { siteId, order } = this.props;
		this.props.saveOrder( siteId, order );
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
						disabled={ ! hasOrderEdits }
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
	dispatch => bindActionCreators( { clearOrderEdits, editOrder, saveOrder }, dispatch )
)( localize( Order ) );
