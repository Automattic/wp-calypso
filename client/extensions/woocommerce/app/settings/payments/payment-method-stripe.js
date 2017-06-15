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

class PaymentMethodStripe extends Component {

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

	renderEditTextbox = ( setting ) => {
		return (
			<FormTextInput name={ setting.id } onChange={ this.onEditFieldHandler } value={ setting.value } />
		);
	}

	renderKeyFields = ( isLiveMode ) => {
		const { method, translate } = this.props;
		const testSecretLabel = translate( 'Test Secret Key' );
		const liveSecretLabel = translate( 'Live Secret Key' );
		const testPublishableLabel = translate( 'Test Publishable Key' );
		const livePublishableLabel = translate( 'Live Publishable Key' );
		return (
			<div>
				<FormFieldset className="payments__method-edit-field-container">
					<FormLabel>
						{ isLiveMode ? liveSecretLabel : testSecretLabel }
					</FormLabel>
					{ this.renderEditTextbox(
						isLiveMode ? method.settings.secret_key : method.settings.test_secret_key
					) }
				</FormFieldset>
				<FormFieldset className="payments__method-edit-field-container">
					<FormLabel>
						{ isLiveMode ? livePublishableLabel : testPublishableLabel }
					</FormLabel>
					{ this.renderEditTextbox(
						isLiveMode ? method.settings.publishable_key : method.settings.test_publishable_key
					) }
				</FormFieldset>
			</div>
		);
	}

	render() {
		const { method, translate } = this.props;
		return (
			<div className="payments__method-edit-fields">
				<FormFieldset className="payments__method-edit-field-container">
					<FormLabel>Enabled</FormLabel>
					{ this.renderEnabledField( method.settings.enabled.value ) }
				</FormFieldset>
				<FormFieldset className="payments__method-edit-field-container">
					<FormLabel>Enable Test Mode</FormLabel>
					<PaymentMethodEditFormToggle
						checked={ method.settings.testmode.value === 'yes' ? true : false }
						name="testmode"
						onChange={ this.onEditFieldHandler } />
				</FormFieldset>
				{ method.settings.testmode.value === 'yes' && this.renderKeyFields( false ) }
				{ method.settings.testmode.value === 'no' && this.renderKeyFields( true ) }
				<FormFieldset className="payments__method-edit-field-container">
					<FormLegend>{ translate( 'Payment authorization' ) }</FormLegend>
					<FormLabel>
						<FormRadio
							name="capture"
							value="yes"
							checked={ 'yes' === method.settings.capture.value }
							onChange={ this.onEditFieldHandler } />
						<span>{ translate( 'Authorize and charge the customers credit card' ) }</span>
					</FormLabel>
					<FormLabel>
						<FormRadio
							name="capture"
							value="no"
							checked={ 'no' === method.settings.capture.value }
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
				<FormFieldset className="payments__method-edit-field-container">
					<FormLabel>Use ApplePay</FormLabel>
					<PaymentMethodEditFormToggle
						checked={ method.settings.apple_pay.value === 'yes' ? true : false }
						name="apple_pay"
						onChange={ this.onEditFieldHandler } />
					<span>
						{ translate(
							'By using ApplePay you aggree to Stripe and ' +
							'Apple\'s terms of service'
						) }
					</span>
				</FormFieldset>
				<Button primary onClick={ this.onSaveHandler }>
					{ translate( 'Save' ) }
				</Button>
			</div>
		);
	}
}

export default localize( PaymentMethodStripe );
