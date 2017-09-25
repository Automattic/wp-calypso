/** @format */
/**
 * External dependencies
 */
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { get } from 'lodash';
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';

/**
 * Internal dependencies
 */
import AddressView from 'woocommerce/components/address-view';
import Card from 'components/card';
import { getOrderWithEdits } from 'woocommerce/state/ui/orders/selectors';
import FormCheckbox from 'components/forms/form-checkbox';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormPhoneMediaInput from 'components/forms/form-phone-media-input';
import FormTextInput from 'components/forms/form-text-input';
// @todo Update this to use our store countries list
import countriesListBuilder from 'lib/countries-list';
const countriesList = countriesListBuilder.forPayments();

class OrderCustomerCard extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		editOrder: PropTypes.func.isRequired,
	};

	state = {
		showShipping: false,
		phoneCountry: 'US',
	};

	getAddressViewFormat = address => {
		return {
			street: address.address_1 || '',
			street2: address.address_2 || '',
			city: address.city || '',
			state: address.state || '',
			country: address.country || '',
			postcode: address.postcode || '',
		};
	};

	onPhoneChange = phone => {
		this.updateOrder( 'phoneNumber', phone.value );
		this.setState( { phoneCountry: phone.countryCode } );
	};

	onAddressChange = ( type = 'billing' ) => {
		return event => {
			this.updateOrder( `${ type }_${ event.target.name }`, event.target.value );
		};
	};

	onChange = event => {
		this.updateOrder( event.target.name, event.target.value );
	};

	/**
	 * Create an object with structure matching the order properties, which contains
	 * the updates to be pushed into the UI redux state (and eventually saved to
	 * the remote site). The input name needs to be mapped to a tree structure,
	 * see http://woocommerce.github.io/woocommerce-rest-api-docs/#order-properties
	 *
	 * @param  {string} name  The field being edited, from the input name
	 * @param  {string} value The input value, which should be saved
	 */
	updateOrder = ( name, value ) => {
		let updateOrder;
		switch ( name ) {
			case 'customerEmail':
				updateOrder = { billing: { email: value } };
				break;
			case 'firstName':
				updateOrder = { billing: { first_name: value } };
				break;
			case 'lastName':
				updateOrder = { billing: { last_name: value } };
				break;
			case 'phoneNumber':
				updateOrder = { billing: { phone: value } };
				break;
			case 'billing_street':
				updateOrder = { billing: { address_1: value } };
				break;
			case 'billing_street2':
				updateOrder = { billing: { address_2: value } };
				break;
			case 'billing_city':
			case 'billing_state':
			case 'billing_country':
			case 'billing_postcode': {
				const keyName = name.replace( 'billing_', '' );
				updateOrder = { billing: { [ keyName ]: value } };
				break;
			}
			case 'shippingFirstName':
				updateOrder = { shipping: { first_name: value } };
				break;
			case 'shippingLastName':
				updateOrder = { shipping: { last_name: value } };
				break;
			case 'shipping_street':
				updateOrder = { shipping: { address_1: value } };
				break;
			case 'shipping_street2':
				updateOrder = { shipping: { address_2: value } };
				break;
			case 'shipping_city':
			case 'shipping_state':
			case 'shipping_country':
			case 'shipping_postcode': {
				const keyName = name.replace( 'shipping_', '' );
				updateOrder = { shipping: { [ keyName ]: value } };
				break;
			}
			default:
				updateOrder = {};
				break;
		}
		if ( this.props.order && this.props.order.id ) {
			updateOrder.id = this.props.order.id;
		}
		this.props.editOrder( updateOrder );
	};

	toggleShipping = () => {
		this.setState( state => ( {
			showShipping: ! state.showShipping,
		} ) );
	};

	renderShipping = () => {
		const { order, translate } = this.props;
		if ( ! this.state.showShipping ) {
			return null;
		}

		return (
			<FormFieldset>
				<div className="order-create__fieldset">
					<div className="order-create__field">
						<FormLabel htmlFor="shippingFirstName">{ translate( 'First Name' ) }</FormLabel>
						<FormTextInput
							id="shippingFirstName"
							name="shippingFirstName"
							value={ get( order, [ 'shipping', 'first_name' ], '' ) }
							onChange={ this.onChange }
						/>
					</div>
					<div className="order-create__field">
						<FormLabel htmlFor="shippingLastName">{ translate( 'Last Name' ) }</FormLabel>
						<FormTextInput
							id="shippingLastName"
							name="shippingLastName"
							value={ get( order, [ 'shipping', 'last_name' ], '' ) }
							onChange={ this.onChange }
						/>
					</div>
				</div>
				<AddressView
					isEditable
					onChange={ this.onAddressChange( 'shipping' ) }
					address={ this.getAddressViewFormat( get( order, [ 'shipping' ], {} ) ) }
				/>
			</FormFieldset>
		);
	};

	render() {
		const { order, translate } = this.props;

		return (
			<Card className="order-create__card order-create__card-customer">
				<FormFieldset>
					<FormLabel htmlFor="customerEmail">{ translate( 'Email address' ) }</FormLabel>
					<FormTextInput
						id="customerEmail"
						name="customerEmail"
						value={ get( order, [ 'billing', 'email' ], '' ) }
						onChange={ this.onChange }
					/>
				</FormFieldset>
				<FormFieldset>
					<FormLegend className="order-create__billing-details">
						{ translate( 'Billing Details' ) }
					</FormLegend>
					<div className="order-create__fieldset">
						<div className="order-create__field">
							<FormLabel htmlFor="firstName">{ translate( 'First Name' ) }</FormLabel>
							<FormTextInput
								id="firstName"
								name="firstName"
								value={ get( order, [ 'billing', 'first_name' ], '' ) }
								onChange={ this.onChange }
							/>
						</div>
						<div className="order-create__field">
							<FormLabel htmlFor="lastName">{ translate( 'Last Name' ) }</FormLabel>
							<FormTextInput
								id="lastName"
								name="lastName"
								value={ get( order, [ 'billing', 'last_name' ], '' ) }
								onChange={ this.onChange }
							/>
						</div>
						<div className="order-create__field">
							<FormPhoneMediaInput
								label={ translate( 'Phone Number' ) }
								onChange={ this.onPhoneChange }
								countryCode={ this.state.phoneCountry }
								countriesList={ countriesList }
								value={ get( order, [ 'billing', 'phone' ], '' ) }
							/>
						</div>
					</div>
					<AddressView
						isEditable
						onChange={ this.onAddressChange( 'billing' ) }
						address={ this.getAddressViewFormat( get( order, [ 'billing' ], {} ) ) }
					/>
				</FormFieldset>
				<FormFieldset>
					<FormLegend className="order-create__shipping-details">
						{ translate( 'Shipping Details' ) }
					</FormLegend>
					<FormLabel>
						<FormCheckbox checked={ ! this.state.showShipping } onChange={ this.toggleShipping } />
						<span>{ translate( 'Same as billing details' ) }</span>
					</FormLabel>
				</FormFieldset>
				{ this.renderShipping() }
			</Card>
		);
	}
}

export default connect( state => ( {
	order: getOrderWithEdits( state ),
} ) )( localize( OrderCustomerCard ) );
