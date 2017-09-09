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
import Card from 'components/card';
import { getOrderWithEdits } from 'woocommerce/state/ui/orders/selectors';
import FormCheckbox from 'components/forms/form-checkbox';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormTelInput from 'components/forms/form-tel-input';
import FormTextInput from 'components/forms/form-text-input';

const AddressSearch = () => null;

class OrderCustomerCard extends Component {
	static propTypes = {
		siteId: PropTypes.number,
		editOrder: PropTypes.func.isRequired,
	}

	state = {
		showShipping: false
	}

	onChange = ( event ) => {
		let updateOrder;
		switch ( event.target.name ) {
			case 'customerEmail':
				updateOrder = { billing: { email: event.target.value } };
				break;
			case 'firstName':
				updateOrder = { billing: { first_name: event.target.value } };
				break;
			case 'lastName':
				updateOrder = { billing: { last_name: event.target.value } };
				break;
			case 'phoneNumber':
				updateOrder = { billing: { phone: event.target.value } };
				break;
			case 'shippingFirstName':
				updateOrder = { shipping: { first_name: event.target.value } };
				break;
			case 'shippingLastName':
				updateOrder = { shipping: { last_name: event.target.value } };
				break;
		}
		if ( this.props.order && this.props.order.id ) {
			updateOrder.id = this.props.order.id;
		}
		this.props.editOrder( updateOrder );
	}

	toggleShipping = () => {
		this.setState( state => ( {
			showShipping: ! state.showShipping
		} ) );
	}

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
							onChange={ this.onChange } />
					</div>
					<div className="order-create__field">
						<FormLabel htmlFor="shippingLastName">{ translate( 'Last Name' ) }</FormLabel>
						<FormTextInput
							id="shippingLastName"
							name="shippingLastName"
							value={ get( order, [ 'shipping', 'last_name' ], '' ) }
							onChange={ this.onChange } />
					</div>
				</div>
				<AddressSearch />
			</FormFieldset>
		);
	}

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
						onChange={ this.onChange } />
				</FormFieldset>
				<FormFieldset>
					<FormLegend>{ translate( 'Billing Details' ) }</FormLegend>
					<div className="order-create__fieldset">
						<div className="order-create__field">
							<FormLabel htmlFor="firstName">{ translate( 'First Name' ) }</FormLabel>
							<FormTextInput
								id="firstName"
								name="firstName"
								value={ get( order, [ 'billing', 'first_name' ], '' ) }
								onChange={ this.onChange } />
						</div>
						<div className="order-create__field">
							<FormLabel htmlFor="lastName">{ translate( 'Last Name' ) }</FormLabel>
							<FormTextInput
								id="lastName"
								name="lastName"
								value={ get( order, [ 'billing', 'last_name' ], '' ) }
								onChange={ this.onChange } />
						</div>
						<div className="order-create__field">
							<FormLabel htmlFor="phoneNumber">{ translate( 'Phone Number' ) }</FormLabel>
							<FormTelInput
								id="phoneNumber"
								name="phoneNumber"
								value={ get( order, [ 'billing', 'phone' ], '' ) }
								onChange={ this.onChange } />
						</div>
					</div>
					<AddressSearch />
				</FormFieldset>
				<FormFieldset>
					<FormLegend>{ translate( 'Shipping Details' ) }</FormLegend>
					<FormLabel>
						<FormCheckbox checked={ ! this.state.showShipping } onClick={ this.toggleShipping } />
						<span>{ translate( 'Same as billing details' ) }</span>
					</FormLabel>
				</FormFieldset>
				{ this.renderShipping() }
			</Card>
		);
	}
}

export default connect(
	state => ( {
		order: getOrderWithEdits( state ),
	} )
)( localize( OrderCustomerCard ) );
