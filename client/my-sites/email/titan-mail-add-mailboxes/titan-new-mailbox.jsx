/**
 * External dependencies
 */
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import FormLabel from 'calypso/components/forms/form-label';
import FormPasswordInput from 'calypso/components/forms/form-password-input';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';
import FormToggle from 'calypso/components/forms/form-toggle';
import Gridicon from 'calypso/components/gridicon';
import { getMailboxPropTypeShape } from 'calypso/lib/titan/new-mailbox';

const noop = () => {};

const TitanNewMailbox = ( {
	onMailboxRemove,
	onMailboxValueChange,
	onReturnKeyPress = noop,
	mailbox: {
		alternativeEmail: { value: alternativeEmail, error: alternativeEmailError },
		domain: { value: domain, error: domainError },
		isAdmin: { value: isAdmin, error: isAdminError },
		mailbox: { value: mailbox, error: mailboxError },
		name: { value: name, error: nameError },
		password: { value: password, error: passwordError },
	},
	showAlternativeEmail = false,
} ) => {
	const translate = useTranslate();

	const hasBeenValidated =
		[ alternativeEmail, mailbox, name, password ].some( ( value ) => '' !== value ) ||
		[
			alternativeEmailError,
			domainError,
			isAdminError,
			mailboxError,
			nameError,
			passwordError,
		].some( ( error ) => null !== error );

	const [ alternativeEmailFieldTouched, setAlternativeEmailFieldTouched ] = useState( false );
	const [ mailboxFieldTouched, setMailboxFieldTouched ] = useState( false );
	const [ nameFieldTouched, setNameFieldTouched ] = useState( false );
	const [ passwordFieldTouched, setPasswordFieldTouched ] = useState( false );

	const hasAlternativeEmailError = alternativeEmailFieldTouched && null !== alternativeEmailError;
	const hasMailboxError = mailboxFieldTouched && null !== mailboxError;
	const hasNameError = nameFieldTouched && null !== nameError;
	const hasPasswordError = passwordFieldTouched && null !== passwordError;

	return (
		<>
			<div className="titan-mail-add-mailboxes__new-mailbox">
				<div className="titan-mail-add-mailboxes__new-mailbox-name-and-remove">
					<FormFieldset>
						<FormLabel>
							{ translate( 'Name' ) }
							<FormTextInput
								placeholder={ translate( 'Name' ) }
								value={ name }
								required
								isError={ hasNameError }
								onChange={ ( event ) => {
									onMailboxValueChange( 'name', event.target.value, mailboxFieldTouched );
								} }
								onBlur={ () => {
									setNameFieldTouched( hasBeenValidated );
								} }
								onKeyUp={ onReturnKeyPress }
								suffix={ `@${ domain }` }
							/>
						</FormLabel>
						{ hasNameError && <FormInputValidation text={ nameError } isError /> }
					</FormFieldset>

					<Button
						className="titan-mail-add-mailboxes__new-mailbox-remove-mailbox-button"
						onClick={ onMailboxRemove }
					>
						<Gridicon icon="trash" />
						<span>{ translate( 'Remove mailbox' ) }</span>
					</Button>
				</div>

				<FormFieldset>
					<FormLabel>
						{ translate( 'Email address' ) }
						<FormTextInputWithAffixes
							placeholder={ translate( 'Email' ) }
							value={ mailbox }
							isError={ hasMailboxError }
							onChange={ ( event ) => {
								onMailboxValueChange( 'mailbox', event.target.value.toLowerCase() );
							} }
							onBlur={ () => {
								setMailboxFieldTouched( hasBeenValidated );
							} }
							onKeyUp={ onReturnKeyPress }
							suffix={ `@${ domain }` }
						/>
					</FormLabel>
					{ hasMailboxError && <FormInputValidation text={ mailboxError } isError /> }
				</FormFieldset>

				<div className="titan-mail-add-mailboxes__new-mailbox-password-and-is-admin">
					<FormFieldset>
						<FormLabel>
							{ translate( 'Password' ) }
							<FormPasswordInput
								autoCapitalize="off"
								autoCorrect="off"
								placeholder={ translate( 'Password' ) }
								value={ password }
								maxLength={ 100 }
								isError={ hasPasswordError }
								onChange={ ( event ) => {
									onMailboxValueChange( 'password', event.target.value );
								} }
								onBlur={ () => {
									setPasswordFieldTouched( hasBeenValidated );
								} }
								onKeyUp={ onReturnKeyPress }
							/>
						</FormLabel>
						{ hasPasswordError && <FormInputValidation text={ passwordError } isError /> }
					</FormFieldset>

					<FormFieldset>
						<FormToggle
							checked={ isAdmin }
							onChange={ ( newValue ) => {
								onMailboxValueChange( 'isAdmin', newValue );
							} }
							help={ translate( 'Should this user have control panel access?' ) }
						>
							{ translate( 'Is admin?' ) }
						</FormToggle>
					</FormFieldset>
				</div>

				{ showAlternativeEmail && (
					<FormFieldset>
						<FormLabel>
							{ translate( 'Alternative email address' ) }
							<FormTextInput
								placeholder={ translate( 'Alternative email' ) }
								value={ alternativeEmail }
								isError={ hasAlternativeEmailError }
								onChange={ ( event ) => {
									onMailboxValueChange( 'alternativeEmail', event.target.value );
								} }
								onBlur={ () => {
									setAlternativeEmailFieldTouched( hasBeenValidated );
								} }
								onKeyUp={ onReturnKeyPress }
							/>
						</FormLabel>
						{ hasAlternativeEmailError && (
							<FormInputValidation text={ alternativeEmailError } isError />
						) }
					</FormFieldset>
				) }
			</div>
			<hr className="titan-mail-add-mailboxes__new-mailbox-separator" />
		</>
	);
};

TitanNewMailbox.propTypes = {
	onMailboxRemove: PropTypes.func.isRequired,
	onMailboxValueChange: PropTypes.func.isRequired,
	onReturnKeyPress: PropTypes.func.isRequired,
	mailbox: getMailboxPropTypeShape(),
	showAlternativeEmail: PropTypes.bool,
};

export default TitanNewMailbox;
