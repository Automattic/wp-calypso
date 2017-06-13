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
import FormPasswordInput from 'components/forms/form-password-input';
import FormSelect from 'components/forms/form-select';
import FormTextInput from 'components/forms/form-text-input';
import FormTextarea from 'components/forms/form-textarea';
import ListItem from 'woocommerce/components/list/list-item';
import PaymentMethodEditFormToggle from './payment-method-edit-form-toggle';

class PaymentMethodEdit extends Component {

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

	renderEditCheckbox = ( setting ) => {
		const checked = 'yes' === setting.value;
		return (
			<PaymentMethodEditFormToggle
				checked={ checked }
				name={ setting.id }
				onChange={ this.onEditFieldHandler } />
		);
	}

	renderEditField = ( editField ) => {
		const setting = this.props.method.settings[ editField ];
		return (
			<FormFieldset className="payments__method-edit-field-container" key={ editField }>
				<FormLabel>{ setting.label }</FormLabel>
				{ 'checkbox' === setting.type && this.renderEditCheckbox( setting ) }
				{ 'email' === setting.type && this.renderEditTextbox( setting ) }
				{ 'password' === setting.type && this.renderEditPassword( setting ) }
				{ 'text' === setting.type && this.renderEditTextbox( setting ) }
				{ 'textarea' === setting.type && this.renderEditTextarea( setting ) }
				{ 'select' === setting.type && this.renderEditSelect( setting ) }
			</FormFieldset>
		);
	}

	renderEditPassword = ( setting ) => {
		return (
			<FormPasswordInput name={ setting.id } onChange={ this.onEditFieldHandler } value={ setting.value } />
		);
	}

	renderEditSelect = ( setting ) => {
		const optionKeys = setting.options && Object.keys( setting.options );
		return (
			<FormSelect name={ setting.id } onChange={ this.onEditFieldHandler } value={ setting.value }>
				{ optionKeys.map( ( option ) => {
					return this.renderSelectOption( option, setting.options[ option ] );
				} ) }
			</FormSelect>
		);
	}

	renderEditTextbox = ( setting ) => {
		return (
			<FormTextInput name={ setting.id } onChange={ this.onEditFieldHandler } value={ setting.value } />
		);
	}

	renderEditTextarea = ( setting ) => {
		return (
			<FormTextarea name={ setting.id } onChange={ this.onEditFieldHandler } value={ setting.value } />
		);
	}

	renderSelectOption = ( key, title ) => {
		return (
			<option key={ key } value={ key }>{ title }</option>
		);
	}

	render() {
		const { method, translate } = this.props;
		const settingsFieldsKeys = method.settings && Object.keys( method.settings );
		return (
			<ListItem>
				{ settingsFieldsKeys.map( this.renderEditField ) }
				<hr />
				<Button primary onClick={ this.onSaveHandler }>
					{ translate( 'Save' ) }
				</Button>
			</ListItem>
		);
	}

}

export default localize( PaymentMethodEdit );
