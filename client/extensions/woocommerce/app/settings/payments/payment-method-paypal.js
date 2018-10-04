/** @format */

/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Dialog from 'components/dialog';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormRadio from 'components/forms/form-radio';
import FormSettingExplanation from 'components/forms/form-setting-explanation';
import FormTextInput from 'components/forms/form-text-input';

class PaymentMethodPaypal extends Component {
	static propTypes = {
		method: PropTypes.shape( {
			settings: PropTypes.shape( {
				title: PropTypes.shape( {
					id: PropTypes.string.isRequired,
					label: PropTypes.string.isRequired,
					type: PropTypes.string.isRequired,
					value: PropTypes.string.isRequired,
				} ),
			} ),
		} ),
		translate: PropTypes.func.isRequired,
		onCancel: PropTypes.func.isRequired,
		onEditField: PropTypes.func.isRequired,
		onDone: PropTypes.func.isRequired,
	};

	onEditFieldHandler = e => {
		this.props.onEditField( e.target.name, e.target.value );

		if ( 'email' === e.target.name ) {
			// also set receiver_email to same value.
			this.props.onEditField( 'receiver_email', e.target.value );
		}
	};

	buttons = [
		{ action: 'cancel', label: this.props.translate( 'Cancel' ), onClick: this.props.onCancel },
		{
			action: 'save',
			label: this.props.translate( 'Done' ),
			onClick: this.props.onDone,
			isPrimary: true,
		},
	];

	render() {
		const {
			method: { settings },
			translate,
		} = this.props;
		return (
			<Dialog
				additionalClassNames="payments__dialog woocommerce"
				buttons={ this.buttons }
				isVisible
			>
				<FormFieldset className="payments__method-edit-field-container">
					<FormLabel>{ translate( 'Your Paypal ID' ) }</FormLabel>
					<FormTextInput
						name="email"
						onChange={ this.onEditFieldHandler }
						value={ settings.email.value }
					/>
					<FormSettingExplanation>
						{ translate(
							"If you don't have a PayPal account yet you " +
								'will receive instructions on how to sign up ' +
								'when you receive your first order via PayPal'
						) }
					</FormSettingExplanation>
				</FormFieldset>
				<FormFieldset className="payments__method-edit-field-container">
					<FormLegend>{ translate( 'Payment authorization' ) }</FormLegend>
					<FormLabel>
						<FormRadio
							name="paymentaction"
							value="sale"
							checked={ 'sale' === settings.paymentaction.value }
							onChange={ this.onEditFieldHandler }
						/>
						<span>
							{ translate( 'Authorize and charge the customers credit card automatically' ) }
						</span>
					</FormLabel>
					<FormLabel>
						<FormRadio
							name="paymentaction"
							value="authorization"
							checked={ 'authorization' === settings.paymentaction.value }
							onChange={ this.onEditFieldHandler }
						/>
						<span>{ translate( 'Authorize the customers credit card but charge manually' ) }</span>
					</FormLabel>
				</FormFieldset>
			</Dialog>
		);
	}
}

export default localize( PaymentMethodPaypal );
