/** @format */

/**
 * External dependencies
 */
import Gridicon from 'gridicons';
import PropTypes from 'prop-types';
import React, { useState } from 'react';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import Button from 'components/button';
import DomainsSelect from './domains-select';
import FormFieldset from 'components/forms/form-fieldset';
import FormTextInput from 'components/forms/form-text-input';
import FormInputValidation from 'components/forms/form-input-validation';
import { userShape } from 'lib/gsuite/new-users';

const GSuiteNewUser = ( {
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
			<FormFieldset>
				<FormTextInput
					placeholder={ translate( 'e.g. %(example)s', { args: { example: contactText } } ) }
					value={ mailBox }
					isError={ hasMailBoxError }
					onChange={ event => {
						onUserValueChange( 'mailBox', event.target.value );
					} }
					onBlur={ () => {
						setMailBoxFieldTouched( wasValidated );
					} }
				/>
				{ hasMailBoxError && <FormInputValidation text={ mailBoxError } isError /> }
				<DomainsSelect
					domains={ domains }
					// isError={ hasMailBoxError }
					onChange={ event => {
						onUserValueChange( 'domain', event.target.value );
					} }
					value={ domain }
				/>
			</FormFieldset>

			<FormFieldset>
				<FormTextInput
					placeholder={ translate( 'First Name' ) }
					value={ firstName }
					maxLength={ 60 }
					isError={ hasFirstNameError }
					onChange={ event => {
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
					onChange={ event => {
						onUserValueChange( 'lastName', event.target.value );
					} }
					onBlur={ () => {
						setLastNameFieldTouched( wasValidated );
					} }
				/>
				{ hasLastNameError && <FormInputValidation text={ lastNameError } isError /> }
			</FormFieldset>
			<Button onClick={ onUserRemove }>
				<Gridicon icon="trash" />
				<span>{ translate( 'Remove User' ) }</span>
			</Button>
		</div>
	);
};

GSuiteNewUser.propTypes = {
	domains: PropTypes.array.isRequired,
	onUserRemove: PropTypes.func.isRequired,
	onUserValueChange: PropTypes.func.isRequired,
	user: userShape.isRequired,
};

export default GSuiteNewUser;
