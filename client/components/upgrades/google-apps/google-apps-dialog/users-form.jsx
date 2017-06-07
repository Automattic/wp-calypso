/**
 * External dependencies
 */
import React from 'react';
import { localize } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import FormFieldset from 'components/forms/form-fieldset';
import FormTextInput from 'components/forms/form-text-input';
import FormTextInputWithAffixes from 'components/forms/form-text-input-with-affixes';
import FormInputValidation from 'components/forms/form-input-validation';

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

		return (
			<div className="google-apps-dialog__user-fields" key={ `google-apps-dialog-user-${ index }` }>
				<FormFieldset>
					<FormTextInputWithAffixes
						className={ this.fieldClasses( 'email' ) }
						placeholder={ translate( 'e.g. %(example)s', { args: { example: contactText } } ) }
						name="email"
						value={ user.email.value }
						suffix={ '@' + domain }
						isError={ !! user.email.error }
						onChange={ this.updateInputField }
						onBlur={ onBlur }
						onClick={ this.recordInputFocusEmail } />
					{ user.email.error ? <FormInputValidation text={ user.email.error } isError={ true } /> : null }
				</FormFieldset>

				<FormFieldset className={ this.fieldClasses( 'first-name' ) }>
					<FormTextInput
						placeholder={ translate( 'First Name' ) }
						name="firstName"
						value={ user.firstName.value }
						maxLength={ 60 }
						isError={ !! user.firstName.error }
						onChange={ this.updateInputField }
						onBlur={ onBlur }
						onClick={ this.recordInputFocusFirstName } />
					{ user.firstName.error ? <FormInputValidation text={ user.firstName.error } isError={ true } /> : null }
				</FormFieldset>

				<FormFieldset className={ this.fieldClasses( 'last-name' ) }>
					<FormTextInput
						placeholder={ translate( 'Last Name' ) }
						name="lastName"
						value={ user.lastName.value }
						maxLength={ 60 }
						isError={ !! user.lastName.error }
						onChange={ this.updateInputField }
						onBlur={ onBlur }
						onClick={ this.recordInputFocusLastName } />
					{ user.lastName.error ? <FormInputValidation text={ user.lastName.error } isError={ true } /> : null }
				</FormFieldset>
			</div>
		);
	}
}

export default ( localize( GoogleAppsUsersForm ) );
