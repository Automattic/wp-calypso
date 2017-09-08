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
		}
		this.props.editOrder( updateOrder );
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
					<FormLegend>{ translate( 'Billing Details' ) }</FormLegend>
					<FormLabel>
						<FormCheckbox />
						<span>{ translate( 'Same as billing details' ) }</span>
					</FormLabel>
				</FormFieldset>
			</Card>
		);
	}
}

export default connect(
	state => ( {
		order: getOrderWithEdits( state ),
	} )
)( localize( OrderCustomerCard ) );
