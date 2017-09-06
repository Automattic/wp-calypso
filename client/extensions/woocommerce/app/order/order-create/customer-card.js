/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

/**
 * Internal dependencies
 */
import Card from 'components/card';
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

	render() {
		const { translate } = this.props;
		return (
			<Card className="order-create__card order-create__card-customer">
				<FormFieldset>
					<FormLabel htmlFor="customerEmail">{ translate( 'Email address' ) }</FormLabel>
					<FormTextInput id="customerEmail" name="customerEmail" />
				</FormFieldset>
				<FormFieldset>
					<FormLegend>{ translate( 'Billing Details' ) }</FormLegend>
					<div className="order-create__fieldset">
						<div className="order-create__field">
							<FormLabel htmlFor="firstName">{ translate( 'First Name' ) }</FormLabel>
							<FormTextInput id="firstName" name="firstName" />
						</div>
						<div className="order-create__field">
							<FormLabel htmlFor="lastName">{ translate( 'Last Name' ) }</FormLabel>
							<FormTextInput id="lastName" name="lastName" />
						</div>
						<div className="order-create__field">
							<FormLabel htmlFor="phoneNumber">{ translate( 'Phone Number' ) }</FormLabel>
							<FormTelInput id="phoneNumber" name="phoneNumber" />
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

export default localize( OrderCustomerCard );
