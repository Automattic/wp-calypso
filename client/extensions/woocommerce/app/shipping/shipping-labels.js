/**
 * External dependencies
 */
import React, { Component } from 'react';
import i18n from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Card from 'components/card';
import Button from 'components/button';
import FormFieldSet from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormSelect from 'components/forms/form-select';
import FormToggle from 'components/forms/form-toggle';
import ShippingCard from './shipping-card';
import ShippingHeader from './shipping-header';

class ShippingLabels extends Component {
	render() {
		const __ = i18n.translate;

		return (
			<div>
				<ShippingHeader
					label={ __( 'Shipping Labels' ) }
					description={ __( 'Print shipping labels at home' ) }>
					<FormToggle	/>
				</ShippingHeader>
				<Card>
					<FormFieldSet>
						<FormLabel className="shipping__labels-paper-size" htmlFor="paper-size">{ __( 'Paper size' ) }</FormLabel>
						<FormSelect name="paper-size">
							<option>Letter</option>
							<option>Legal</option>
							<option>Label (4"x6")</option>
							<option>A4</option>
						</FormSelect>
					</FormFieldSet>
					<FormFieldSet>
						<FormLabel className="shipping__cards-label">{ __( 'Credit card' ) }</FormLabel>
						<p className="shipping__header-description shipping__credit-card-description">
							{ __( 'Pay for the labels you’ll print with the ' +
								'credit card you pay for WordPress.com plan or add another one.' ) }
						</p>

						<ShippingCard
							type="VISA"
							digits="1234"
							name="Name Surname"
							date="12/19" />

						<Button>{ __( 'Add another credit card' ) }</Button>
					</FormFieldSet>
				</Card>
			</div>
		);
	}
}

export default ShippingLabels;
