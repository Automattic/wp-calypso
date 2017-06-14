/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormLegend from 'components/forms/form-legend';
import FormRadio from 'components/forms/form-radio';
import FormTextInput from 'components/forms/form-text-input';
import PaymentMethodEditFormToggle from './payment-method-edit-form-toggle';

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
		onEditField: PropTypes.func.isRequired,
	};

	onEditFieldHandler = ( e ) => {
		this.props.onEditField( e.target.name, e.target.value );
	}

	onSaveHandler = () => {
		this.props.onSave( this.props.method );
	}

	renderEnabledField = ( isEnabled ) => {
		return (
			<PaymentMethodEditFormToggle
				checked={ isEnabled === 'yes' ? true : false }
				name="enabled"
				onChange={ this.onEditFieldHandler } />
		);
	}

	renderPaypalId = ( value ) => {
		return (
			<FormTextInput
				name="email"
				onChange={ this.onEditFieldHandler }
				value={ value } />
		);
	}

	render() {
		const { method, translate } = this.props;
		return (
			<div className="payments__method-edit-fields">
				<FormFieldset className="payments__method-edit-field-container">
					<FormLabel>{ translate( 'Enabled' ) }</FormLabel>
					{ this.renderEnabledField( method.settings.enabled.value ) }
				</FormFieldset>
				<FormFieldset className="payments__method-edit-field-container">
					<FormLabel>{ translate( 'Your Paypal ID' ) }</FormLabel>
					{ this.renderPaypalId( method.settings.email.value ) }
					<span>
						{ translate(
							'If you don\'t have a PayPal account yet you ' +
							'will receive instructions on how to sign up ' +
							'when you receive your first order via PayPal'
						) }
					</span>
				</FormFieldset>
				<FormFieldset className="payments__method-edit-field-container">
					<FormLegend>{ translate( 'Payment authorization' ) }</FormLegend>
					<FormLabel>
						<FormRadio
							name="paymentaction"
							value="sale"
							checked={ 'sale' === method.settings.paymentaction.value }
							onChange={ this.onEditFieldHandler } />
						<span>{ translate( 'Authorize and charge the customers credit card' ) }</span>
					</FormLabel>
					<FormLabel>
						<FormRadio
							name="paymentaction"
							value="authorization"
							checked={ 'authorization' === method.settings.paymentaction.value }
							onChange={ this.onEditFieldHandler } />
						<span>{ translate( 'Only authorize the customers credit card' ) }</span>
						<span>
							{ translate(
								'You will then have to manually capture the ' +
								'payment'
							) }
						</span>
					</FormLabel>
				</FormFieldset>
				<Button primary onClick={ this.onSaveHandler }>
					{ translate( 'Save' ) }
				</Button>
			</div>
		);
	}
}

export default localize( PaymentMethodPaypal );
