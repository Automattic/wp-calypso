/** @format */

/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import React, { ChangeEvent, FunctionComponent, useState } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import DomainsSelect from './domains-select';
import FormFieldset from 'components/forms/form-fieldset';
import FormTextInput from 'components/forms/form-text-input';
import FormInputValidation from 'components/forms/form-input-validation';
import { GSuiteNewUser as NewUser } from 'lib/gsuite/new-users';

interface Props {
	domains: any[];
	onUserRemove: () => void;
	onUserValueChange: ( field: string, value: string ) => void;
	user: NewUser;
}

const GSuiteNewUser: FunctionComponent< Props > = ( {
	domains,
	onUserRemove,
	onUserValueChange,
	user: {
		firstName: { value: firstName, error: firstNameError },
		lastName: { value: lastName, error: lastNameError },
		mailBox: { value: mailBox, error: mailBoxError },
		domain: { value: domain, error: domainError },
	},
} ) => {
	const translate = useTranslate();
	const contactText = translate( 'contact', {
		context: 'part of e-mail address',
		comment: 'As it would be part of an e-mail address contact@example.com',
	} );

	// use this to control setting the "touched" states below. That way the user will not possibly see a bunch of
	// "This field is required" errors pop at once
	const wasValidated =
		[ firstName, lastName, mailBox ].some( value => '' !== value ) ||
		[ firstNameError, lastNameError, mailBoxError, domainError ].some( value => null !== value );

	const [ firstNameFieldTouched, setFirstNameFieldTouched ] = useState( false );
	const [ lastNameFieldTouched, setLastNameFieldTouched ] = useState( false );
	const [ mailBoxFieldTouched, setMailBoxFieldTouched ] = useState( false );

	const hasMailBoxError = mailBoxFieldTouched && null !== mailBoxError;
	const hasFirstNameError = firstNameFieldTouched && null !== firstNameError;
	const hasLastNameError = lastNameFieldTouched && null !== lastNameError;

	return (
		<div>
			<FormFieldset className="gsuite-new-user-list__form">
				<FormTextInput
					placeholder={ translate( 'e.g. %(example)s', { args: { example: contactText } } ) }
					value={ mailBox }
					isError={ hasMailBoxError }
					onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
						onUserValueChange( 'mailBox', event.target.value );
					} }
					onBlur={ () => {
						setMailBoxFieldTouched( wasValidated );
					} }
				/>
				{ hasMailBoxError && <FormInputValidation text={ mailBoxError } isError /> }
				<DomainsSelect
					domains={ domains }
					onChange={ event => {
						onUserValueChange( 'domain', event.target.value );
					} }
					value={ domain }
				/>
			</FormFieldset>

			<FormFieldset className="gsuite-new-user-list__form">
				<FormTextInput
					placeholder={ translate( 'First Name' ) }
					value={ firstName }
					maxLength={ 60 }
					isError={ hasFirstNameError }
					onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
						onUserValueChange( 'firstName', event.target.value );
					} }
					onBlur={ () => {
						setFirstNameFieldTouched( wasValidated );
					} }
				/>
				{ hasFirstNameError && <FormInputValidation text={ firstNameError } isError /> }
				<FormTextInput
					placeholder={ translate( 'Last Name' ) }
					value={ lastName }
					maxLength={ 60 }
					isError={ hasLastNameError }
					onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
						onUserValueChange( 'lastName', event.target.value );
					} }
					onBlur={ () => {
						setLastNameFieldTouched( wasValidated );
					} }
				/>
				{ hasLastNameError && <FormInputValidation text={ lastNameError } isError /> }
			</FormFieldset>
			<Button
				className="gsuite-new-user-list__new-user-remove-user-button"
				onClick={ onUserRemove }
			>
				<Gridicon icon="trash" />
				<span>{ translate( 'Remove User' ) }</span>
			</Button>
		</div>
	);
};

export default GSuiteNewUser;
