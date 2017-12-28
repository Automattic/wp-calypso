/** @format */
/**
 * External dependencies
 */
import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { every, isEmpty } from 'lodash';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import AddressView from 'client/extensions/woocommerce/components/address-view';
import Button from 'client/components/button';
import Card from 'client/components/card';
import CustomerAddressDialog from './dialog';
import { editOrder } from 'client/extensions/woocommerce/state/ui/orders/actions';
import getAddressViewFormat from 'client/extensions/woocommerce/lib/get-address-view-format';
import { getOrderWithEdits } from 'client/extensions/woocommerce/state/ui/orders/selectors';
import { getSelectedSiteId } from 'client/state/ui/selectors';
import SectionHeader from 'client/components/section-header';

class OrderCustomerInfo extends Component {
	static propTypes = {
		editOrder: PropTypes.func.isRequired,
		orderId: PropTypes.oneOfType( [
			PropTypes.number, // A number indicates an existing order
			PropTypes.shape( { id: PropTypes.string } ), // Placeholders have format { id: 'order_1' }
		] ).isRequired,
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

	renderBilling = ( address = {} ) => {
		const { translate } = this.props;
		if ( every( address, isEmpty ) ) {
			return (
				<Button
					className="order-customer__add-link"
					onClick={ this.toggleDialog( 'billing' ) }
					primary
				>
					{ translate( 'Add Billing Address' ) }
				</Button>
			);
		}
		return (
			<Fragment>
				<h4>{ translate( 'Address' ) }</h4>
				<div className="order-customer__billing-address">
					<p>{ `${ address.first_name } ${ address.last_name }` }</p>
					<AddressView address={ getAddressViewFormat( address ) } />
				</div>

				<h4>{ translate( 'Email' ) }</h4>
				<p>{ address.email }</p>

				<h4>{ translate( 'Phone' ) }</h4>
				<div className="order-customer__billing-phone">{ address.phone }</div>
				<Button className="order-customer__add-link" onClick={ this.toggleDialog( 'billing' ) }>
					{ translate( 'Edit Address' ) }
				</Button>
			</Fragment>
		);
	};

	renderShipping = ( address = {} ) => {
		const { translate } = this.props;
		if ( every( address, isEmpty ) ) {
			return (
				<Button
					className="order-customer__add-link"
					onClick={ this.toggleDialog( 'shipping' ) }
					primary
				>
					{ translate( 'Add Shipping Address' ) }
				</Button>
			);
		}
		return (
			<Fragment>
				<h4>{ translate( 'Address' ) }</h4>
				<div className="order-customer__shipping-address">
					<p>{ `${ address.first_name } ${ address.last_name }` }</p>
					<AddressView address={ getAddressViewFormat( address ) } />
				</div>
				<Button className="order-customer__add-link" onClick={ this.toggleDialog( 'shipping' ) }>
					{ translate( 'Edit Address' ) }
				</Button>
			</Fragment>
		);
	};

	render() {
		const { orderId, order = {}, translate } = this.props;
		if ( ! orderId ) {
			return null;
		}

		return (
			<div className="order-customer__create order-customer">
				<SectionHeader label={ translate( 'Customer Information' ) } />
				<Card>
					<div className="order-customer__container">
						<div className="order-customer__billing">
							<h3 className="order-customer__billing-details">
								{ translate( 'Billing Details' ) }
							</h3>
							{ this.renderBilling( order.billing ) }
						</div>

						<div className="order-customer__shipping">
							<h3 className="order-customer__shipping-details">
								{ translate( 'Shipping Details' ) }
							</h3>
							{ this.renderShipping( order.shipping ) }
						</div>
					</div>
				</Card>
				{ this.renderDialogs() }
			</div>
		);
	}
}

export default connect(
	state => {
		const siteId = getSelectedSiteId( state );
		const order = getOrderWithEdits( state );

		return {
			order,
			siteId,
		};
	},
	dispatch => bindActionCreators( { editOrder }, dispatch )
)( localize( OrderCustomerInfo ) );
