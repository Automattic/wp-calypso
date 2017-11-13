/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AddressView from 'woocommerce/components/address-view';
import Button from 'components/button';
import Card from 'components/card';
import CustomerAddressDialog from './dialog';
import { editOrder } from 'woocommerce/state/ui/orders/actions';
import { isCurrentlyEditingOrder, getOrderWithEdits } from 'woocommerce/state/ui/orders/selectors';
import { isOrderFinished } from 'woocommerce/lib/order-status';
import getAddressViewFormat from 'woocommerce/lib/get-address-view-format';
import { getOrder } from 'woocommerce/state/sites/orders/selectors';
import { getSelectedSiteId } from 'state/ui/selectors';
import SectionHeader from 'components/section-header';

class OrderCustomerInfo extends Component {
	static propTypes = {
		editOrder: PropTypes.func.isRequired,
		isEditing: PropTypes.bool,
		orderId: PropTypes.number.isRequired,
		order: PropTypes.shape( {
			billing: PropTypes.object.isRequired,
			shipping: PropTypes.object.isRequired,
		} ),
		siteId: PropTypes.number.isRequired,
	};

	state = {
		showDialog: false,
	};

	updateAddress = ( type = 'billing' ) => {
		const { siteId, order } = this.props;
		return address => {
			const { copyToShipping = false, ...newAddress } = address;
			if ( siteId ) {
				this.props.editOrder( siteId, { id: order.id, [ type ]: newAddress } );
				if ( copyToShipping && 'billing' === type ) {
					this.props.editOrder( siteId, { id: order.id, shipping: newAddress } );
				}
			}
		};
	};

	toggleDialog = type => {
		return () => {
			this.setState( { showDialog: type } );
		};
	};

	renderDialogs = () => {
		const { billing, shipping } = this.props.order;
		return [
			<CustomerAddressDialog
				key="dialog-billing"
				address={ billing }
				closeDialog={ this.toggleDialog( false ) }
				isBilling
				isVisible={ 'billing' === this.state.showDialog }
				updateAddress={ this.updateAddress( 'billing' ) }
			/>,
			<CustomerAddressDialog
				key="dialog-shipping"
				address={ shipping }
				closeDialog={ this.toggleDialog( false ) }
				isVisible={ 'shipping' === this.state.showDialog }
				updateAddress={ this.updateAddress( 'shipping' ) }
			/>,
		];
	};

	render() {
		const { isEditing, order, translate } = this.props;
		if ( ! order ) {
			return null;
		}

		const { billing, shipping } = order;
		const isEditable = isEditing && ! isOrderFinished( order.status );

		return (
			<div className="order-customer">
				<SectionHeader label={ translate( 'Customer Information' ) } />
				<Card>
					<div className="order-customer__container">
						<div className="order-customer__billing">
							<h3 className="order-customer__billing-details">
								{ translate( 'Billing Details' ) }
								{ isEditable ? (
									<Button
										compact
										className="order-customer__edit-link"
										onClick={ this.toggleDialog( 'billing' ) }
										borderless
									>
										{ translate( 'Edit' ) }
									</Button>
								) : null }
							</h3>
							<h4>{ translate( 'Address' ) }</h4>
							<div className="order-customer__billing-address">
								<p>{ `${ billing.first_name } ${ billing.last_name }` }</p>
								<AddressView address={ getAddressViewFormat( billing ) } />
							</div>

							<h4>{ translate( 'Email' ) }</h4>
							<p>{ billing.email }</p>

							<h4>{ translate( 'Phone' ) }</h4>
							<span>{ billing.phone }</span>
						</div>

						<div className="order-customer__shipping">
							<h3 className="order-customer__shipping-details">
								{ translate( 'Shipping Details' ) }
								{ isEditable ? (
									<Button
										compact
										className="order-customer__edit-link"
										onClick={ this.toggleDialog( 'shipping' ) }
										borderless
									>
										{ translate( 'Edit' ) }
									</Button>
								) : null }
							</h3>
							<h4>{ translate( 'Address' ) }</h4>
							<div className="order-customer__shipping-address">
								<p>{ `${ shipping.first_name } ${ shipping.last_name }` }</p>
								<AddressView address={ getAddressViewFormat( shipping ) } />
							</div>
						</div>
					</div>
				</Card>
				{ isEditing && this.renderDialogs() }
			</div>
		);
	}
}

export default connect(
	( state, props ) => {
		const siteId = getSelectedSiteId( state );
		const isEditing = isCurrentlyEditingOrder( state );
		const order = isEditing ? getOrderWithEdits( state ) : getOrder( state, props.orderId );

		return {
			isEditing,
			order,
			siteId,
		};
	},
	dispatch => bindActionCreators( { editOrder }, dispatch )
)( localize( OrderCustomerInfo ) );
