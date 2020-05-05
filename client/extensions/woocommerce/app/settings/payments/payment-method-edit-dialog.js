/**
 * External dependencies
 */

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { localize } from 'i18n-calypso';
import { isArray } from 'lodash';

/**
 * Internal dependencies
 */
import { Dialog } from '@automattic/components';
import FormFieldset from 'components/forms/form-fieldset';
import FormLabel from 'components/forms/form-label';
import FormPasswordInput from 'components/forms/form-password-input';
import FormSelect from 'components/forms/form-select';
import FormTextInput from 'components/forms/form-text-input';
import FormTextarea from 'components/forms/form-textarea';
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
		onCancel: PropTypes.func.isRequired,
		onEditField: PropTypes.func.isRequired,
		onDone: PropTypes.func.isRequired,
	};

	onEditFieldHandler = ( e ) => {
		this.props.onEditField( e.target.name, e.target.value );
	};

	renderEditCheckbox = ( setting ) => {
		const checked = 'yes' === setting.value;
		return (
			<PaymentMethodEditFormToggle
				checked={ checked }
				name={ setting.id }
				onChange={ this.onEditFieldHandler }
			/>
		);
	};

	renderEditField = ( editField ) => {
		const { method } = this.props;
		if ( method.fields && isArray( method.fields ) && method.fields.indexOf( editField ) < 0 ) {
			return;
		}
		const setting = method.settings[ editField ];
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
	};

	renderEditPassword = ( setting ) => {
		return (
			<FormPasswordInput
				name={ setting.id }
				onChange={ this.onEditFieldHandler }
				value={ setting.value }
			/>
		);
	};

	renderEditSelect = ( setting ) => {
		const optionKeys = setting.options && Object.keys( setting.options );
		return (
			<FormSelect name={ setting.id } onChange={ this.onEditFieldHandler } value={ setting.value }>
				{ optionKeys.map( ( option ) => {
					return this.renderSelectOption( option, setting.options[ option ] );
				} ) }
			</FormSelect>
		);
	};

	renderEditTextbox = ( setting ) => {
		return (
			<FormTextInput
				name={ setting.id }
				onChange={ this.onEditFieldHandler }
				value={ setting.value }
			/>
		);
	};

	renderEditTextarea = ( setting ) => {
		return (
			<FormTextarea
				name={ setting.id }
				onChange={ this.onEditFieldHandler }
				value={ setting.value }
			/>
		);
	};

	renderSelectOption = ( key, title ) => {
		return (
			<option key={ key } value={ key }>
				{ title }
			</option>
		);
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
		const { method } = this.props;
		const settingsFieldsKeys = method.settings && Object.keys( method.settings );
		return (
			<Dialog
				additionalClassNames="payments__dialog woocommerce"
				buttons={ this.buttons }
				isVisible
			>
				{ settingsFieldsKeys.map( this.renderEditField ) }
			</Dialog>
		);
	}
}

export default localize( PaymentMethodEdit );
