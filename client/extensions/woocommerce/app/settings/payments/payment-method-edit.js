/**
 * External dependencies
 */
import React, { Component, PropTypes } from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import FormPasswordInput from 'components/forms/form-password-input';
import FormTextInput from 'components/forms/form-text-input';
import FormSelect from 'components/forms/form-select';
import ListItem from 'woocommerce/components/list/list-item';
import PaymentMethodEditFormToggle from './payment-method-edit-form-toggle';

class PaymentMethodEdit extends Component {

	static propTypes = {
		method: PropTypes.object,
		translate: PropTypes.func,
		onEditField: PropTypes.func,
	};

	onEditFieldHandler = ( e ) => {
		this.props.onEditField( e.target.name, e.target.value );
	}

	onSaveHandler = () => {
		this.props.onSave( this.props.method );
	}

	renderEditCheckbox = ( setting ) => {
		const checked = setting.value === 'yes';
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
			<div className="payments__method-edit-field-container" key={ editField }>
				{ setting.label }
				{ setting.type === 'checkbox' && this.renderEditCheckbox( setting ) }
				{ setting.type === 'email' && this.renderEditTextbox( setting ) }
				{ setting.type === 'password' && this.renderEditPassword( setting ) }
				{ setting.type === 'text' && this.renderEditTextbox( setting ) }
				{ setting.type === 'select' && this.renderEditSelect( setting ) }
				<hr />
			</div>
		);
	}

	renderEditPassword = ( setting ) => {
		return (
			<FormPasswordInput name={ setting.id } onChange={ this.onEditFieldHandler } value={ setting.value } />
		);
	}

	renderEditSelect = ( setting ) => {
		const optionKeys = Object.keys( setting.options );
		return (
			<FormSelect name={ setting.id } onChange={ this.onEditFieldHandler } value={ setting.value }>
				{ optionKeys && optionKeys.map( ( option ) => {
					return this.renderSelectOptions( option, setting.options[ option ] );
				} ) }
			</FormSelect>
		);
	}

	renderEditTextbox = ( setting ) => {
		return (
			<FormTextInput name={ setting.id } onChange={ this.onEditFieldHandler } value={ setting.value } />
		);
	}

	renderSelectOptions = ( key, title ) => {
		return (
			<option key={ key } value={ key }>{ title }</option>
		);
	}

	render() {
		const { method, translate } = this.props;
		const settingsFieldsKeys = Object.keys( method.settings );
		return (
			<ListItem>
				{
					settingsFieldsKeys &&
					settingsFieldsKeys.length &&
					settingsFieldsKeys.map( this.renderEditField )
				}
				<Button compact onClick={ this.onSaveHandler }>
					{ translate( 'save' ) }
				</Button>
			</ListItem>
		);
	}

}

export default localize( PaymentMethodEdit );
