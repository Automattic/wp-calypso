import { ToggleControl } from '@wordpress/components';
import { useTranslate, useRtl } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import FormLabel from 'calypso/components/forms/form-label';
import FormPasswordInput from 'calypso/components/forms/form-password-input';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';
import { getMailboxPropTypeShape } from 'calypso/lib/titan/new-mailbox';

import './style.scss';

export const FULL_NAME_TITAN_FIELD = 'name';
export const PASSWORD_RESET_TITAN_FIELD = 'alternativeEmail';

const noop = () => {};

const TitanNewMailbox = ( {
	hiddenFields = [],
	onMailboxValueChange,
	onReturnKeyPress = noop,
	mailbox: {
		alternativeEmail: { value: alternativeEmail, error: alternativeEmailError },
		domain: { error: domainError },
		isAdmin: { value: isAdmin, error: isAdminError },
		mailbox: { value: mailbox, error: mailboxError },
		name: { value: name, error: nameError },
		password: { value: password, error: passwordError },
	},
	selectedDomainName,
	showAllErrors = false,
} ) => {
	const translate = useTranslate();
	const isRtl = useRtl();

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

	const hasAlternativeEmailError =
		( alternativeEmailFieldTouched || showAllErrors ) &&
		null !== alternativeEmailError &&
		! hiddenFields.includes( PASSWORD_RESET_TITAN_FIELD );
	const hasMailboxError = ( mailboxFieldTouched || showAllErrors ) && null !== mailboxError;
	const hasNameError =
		( nameFieldTouched || showAllErrors ) &&
		null !== nameError &&
		! hiddenFields.includes( FULL_NAME_TITAN_FIELD );
	const hasPasswordError = ( passwordFieldTouched || showAllErrors ) && null !== passwordError;

	const showIsAdminToggle = false;

	return (
		<>
			<div className="titan-new-mailbox">
				{ ! hiddenFields.includes( FULL_NAME_TITAN_FIELD ) && (
					<div className="titan-new-mailbox__name-and-remove">
						<FormFieldset>
							<FormLabel>
								{ translate( 'Full name' ) }
								<FormTextInput
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
								/>
							</FormLabel>
							{ hasNameError && <FormInputValidation text={ nameError } isError /> }
						</FormFieldset>
					</div>
				) }
				<FormFieldset>
					<FormLabel>
						{ translate( 'Email address' ) }
						<FormTextInputWithAffixes
							value={ mailbox }
							isError={ hasMailboxError }
							onChange={ ( event ) => {
								onMailboxValueChange( 'mailbox', event.target.value.toLowerCase() );
							} }
							onBlur={ () => {
								setMailboxFieldTouched( hasBeenValidated );
							} }
							onKeyUp={ onReturnKeyPress }
							prefix={ isRtl ? `\u200e@${ selectedDomainName }\u202c` : null }
							suffix={ isRtl ? null : `\u200e@${ selectedDomainName }\u202c` }
						/>
					</FormLabel>
					{ hasMailboxError && <FormInputValidation text={ mailboxError } isError /> }
				</FormFieldset>
				<FormFieldset>
					<FormLabel>
						{ translate( 'Password' ) }
						<FormPasswordInput
							autoCapitalize="off"
							autoCorrect="off"
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
				{ showIsAdminToggle && (
					<FormFieldset>
						<ToggleControl
							checked={ isAdmin }
							onChange={ ( newValue ) => {
								onMailboxValueChange( 'isAdmin', newValue );
							} }
							help={ translate( 'Should this user have control panel access?' ) }
							label={ translate( 'Is admin?' ) }
						/>
					</FormFieldset>
				) }
				{ ! hiddenFields.includes( PASSWORD_RESET_TITAN_FIELD ) && (
					<FormFieldset>
						<FormLabel>
							{ translate( 'Password reset email address', {
								comment: 'This is the email address we will send password reset emails to',
							} ) }
							<FormTextInput
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
		</>
	);
};

TitanNewMailbox.propTypes = {
	onMailboxValueChange: PropTypes.func.isRequired,
	onReturnKeyPress: PropTypes.func.isRequired,
	mailbox: getMailboxPropTypeShape(),
	showAllErrors: PropTypes.bool,
	selectedDomainName: PropTypes.string.isRequired,
};

export default TitanNewMailbox;
