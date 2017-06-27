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
		onEditField: PropTypes.func.isRequired,
	};

	onEditFieldHandler = ( e ) => {
		this.props.onEditField( e.target.name, e.target.value );
	}

	onSaveHandler = () => {
		this.props.onSave( this.props.method );
	}

	render() {
		const { method: { settings }, translate } = this.props;
		return (
			<div className="payments__method-edit-fields">
				<FormFieldset className="payments__method-edit-field-container">
					<FormLabel>{ translate( 'Your Paypal ID' ) }</FormLabel>
					<FormTextInput
						name="email"
						onChange={ this.onEditFieldHandler }
						value={ settings.email.value }
					/>
					<FormSettingExplanation>
						{ translate(
							'If you don\'t have a PayPal account yet you ' +
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
							onChange={ this.onEditFieldHandler } />
						<span>{ translate( 'Authorize and charge the customers credit card automatically' ) }</span>
					</FormLabel>
					<FormLabel>
						<FormRadio
							name="paymentaction"
							value="authorization"
							checked={ 'authorization' === settings.paymentaction.value }
							onChange={ this.onEditFieldHandler } />
						<span>{ translate( 'Authorize the customers credit card but charge manually' ) }</span>
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
