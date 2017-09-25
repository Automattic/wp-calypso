/**
 * External dependencies
 */
import { localize } from 'i18n-calypso';
import { get } from 'lodash';
import React from 'react';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormInputValidation from 'components/forms/form-input-validation';
import FormTextInput from 'components/forms/form-text-input';
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';

class GoogleAppsUsersForm extends React.Component {
	fieldClasses( fieldName ) {
		return `google-apps-dialog__user-field google-apps-dialog__user-${ fieldName }`;
	}

	updateInputField = ( event ) => {
		this.props.updateField( this.props.index, event );
	};

	recordInputFocusEmail = () => {
		this.props.recordInputFocus( this.props.index, 'Email' );
	};

	recordInputFocusFirstName = () => {
		this.props.recordInputFocus( this.props.index, 'First Name' );
	};

	recordInputFocusLastName = () => {
		this.props.recordInputFocus( this.props.index, 'Last Name' );
	};

	render() {
		const { index, user, domain, onBlur, translate } = this.props;
		const contactText = translate(
			'contact',
			{
				context: 'part of e-mail address',
				comment: 'As it would be part of an e-mail address contact@example.com'
			}
		);
		const emailError = get( user, 'email.error', false );
		const firstNameError = get( user, 'firstName.error', false );
		const lastNameError = get( user, 'lastName.error', false );

		return (
			<div className="google-apps-dialog__user-fields" key={ `google-apps-dialog-user-${ index }` }>
				<FormFieldset>
					<FormTextInputWithAffixes
						className={ this.fieldClasses( 'email' ) }
						placeholder={ translate( 'e.g. %(example)s', { args: { example: contactText } } ) }
						name="email"
						value={ get( user, 'email.value', '' ) }
						suffix={ '@' + domain }
						isError={ emailError }
						onChange={ this.updateInputField }
						onBlur={ onBlur }
						onClick={ this.recordInputFocusEmail } />
					{ emailError ? <FormInputValidation text={ emailError } isError={ true } /> : null }
				</FormFieldset>

				<FormFieldset className={ this.fieldClasses( 'first-name' ) }>
					<FormTextInput
						placeholder={ translate( 'First Name' ) }
						name="firstName"
						value={ get( user, 'firstName.value', '' ) }
						maxLength={ 60 }
						isError={ firstNameError }
						onChange={ this.updateInputField }
						onBlur={ onBlur }
						onClick={ this.recordInputFocusFirstName } />
					{ firstNameError ? <FormInputValidation text={ firstNameError } isError={ true } /> : null }
				</FormFieldset>

				<FormFieldset className={ this.fieldClasses( 'last-name' ) }>
					<FormTextInput
						placeholder={ translate( 'Last Name' ) }
						name="lastName"
						value={ get( user, 'lastName.value', '' ) }
						maxLength={ 60 }
						isError={ lastNameError }
						onChange={ this.updateInputField }
						onBlur={ onBlur }
						onClick={ this.recordInputFocusLastName } />
					{ lastNameError ? <FormInputValidation text={ lastNameError } isError={ true } /> : null }
				</FormFieldset>
			</div>
		);
	}
}

export default localize( GoogleAppsUsersForm );
