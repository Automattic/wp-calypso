/** @format */

/**
 * External dependencies
 */
import React, { useState } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import DomainsSelect from './domains-select';
import FormFieldset from 'components/forms/form-fieldset';
import FormTextInput from 'components/forms/form-text-input';
import FormInputValidation from 'components/forms/form-input-validation';

const GSuiteSingleUserForm = ( {
	userId,
	domains,
	user: {
		firstName: { value: firstName, error: firstNameError },
		lastName: { value: lastName, error: lastNameError },
		mailBox: { value: mailBox, error: mailBoxError },
		domain: { value: domain },
	},
	onUserChange,
} ) => {
	const translate = useTranslate();
	const contactText = translate( 'contact', {
		context: 'part of e-mail address',
		comment: 'As it would be part of an e-mail address contact@example.com',
	} );

	const [ firstNameFieldTouched, setFirstNameFieldTouched ] = useState( false );
	const [ lastNameFieldTouched, setLastNameFieldTouched ] = useState( false );
	const [ mailBoxFieldTouched, setMailBoxFieldTouched ] = useState( false );

	const hasMailBoxError = mailBoxFieldTouched && null !== mailBoxError;

	return (
		<div>
			<FormFieldset>
				<FormTextInput
					placeholder={ translate( 'e.g. %(example)s', { args: { example: contactText } } ) }
					value={ mailBox }
					isError={ hasMailBoxError }
					onChange={ event => {
						onUserChange( userId, 'mailBox', event.target.value );
					} }
					onBlur={ () => {
						setMailBoxFieldTouched( true );
					} }
				/>
				<DomainsSelect
					domains={ domains }
					isError={ hasMailBoxError }
					onChange={ event => {
						onUserChange( userId, 'domain', event.target.value );
					} }
					value={ domain }
				/>
			</FormFieldset>
			{ hasMailBoxError && <FormInputValidation text={ mailBoxError } isError={ true } /> }
			<FormFieldset>
				<FormTextInput
					placeholder={ translate( 'First Name' ) }
					value={ firstName }
					maxLength={ 60 }
					isError={ firstNameFieldTouched && null !== firstNameError }
					onChange={ event => {
						onUserChange( userId, 'firstName', event.target.value );
					} }
					onBlur={ () => {
						setFirstNameFieldTouched( true );
					} }
				/>
				{ firstNameFieldTouched && null !== firstNameError && (
					<FormInputValidation text={ firstNameError } isError={ true } />
				) }
				<FormTextInput
					placeholder={ translate( 'Last Name' ) }
					value={ lastName }
					maxLength={ 60 }
					isError={ lastNameFieldTouched && null !== lastNameError }
					onChange={ event => {
						onUserChange( userId, 'lastName', event.target.value );
					} }
					onBlur={ () => {
						setLastNameFieldTouched( true );
					} }
				/>
				{ lastNameFieldTouched && null !== lastNameError && (
					<FormInputValidation text={ lastNameError } isError={ true } />
				) }
			</FormFieldset>
		</div>
	);
};

export default GSuiteSingleUserForm;
