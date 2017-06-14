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

	render() {
		const { method, translate } = this.props;
		return (
			<div className="payments__method-edit-pane">
				<FormFieldset className="payments__method-edit-field-container">
					<FormLabel>Enabled</FormLabel>
					{ this.renderEnabledField( method.settings.enabled.value ) }
				</FormFieldset>
				<FormFieldset className="payments__method-edit-field-container">
					<FormLabel>Sort Code</FormLabel>
					{ this.renderEnabledField( method.enabled ) }
				</FormFieldset>
				<FormFieldset className="payments__method-edit-field-container">
					<FormLabel>Account Number</FormLabel>
					{ this.renderEnabledField( method.enabled ) }
				</FormFieldset>
				<Button primary onClick={ this.onSaveHandler }>
					{ translate( 'Save' ) }
				</Button>
			</div>
		);
	}
}

export default localize( PaymentMethodStripe );
