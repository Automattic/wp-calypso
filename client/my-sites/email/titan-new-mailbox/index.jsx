import { ToggleControl } from '@wordpress/components';
import classNames from 'classnames';
import { useTranslate } from 'i18n-calypso';
import PropTypes from 'prop-types';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import FormLabel from 'calypso/components/forms/form-label';
import FormPasswordInput from 'calypso/components/forms/form-password-input';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';
import { getSelectedDomain } from 'calypso/lib/domains';
import { getMailboxPropTypeShape } from 'calypso/lib/titan/new-mailbox';
import { getDomainsBySiteId } from 'calypso/state/sites/domains/selectors';

import './style.scss';

const noop = () => {};

const TitanNewMailbox = ( {
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
	showLabels = true,
	siteId,
} ) => {
	const translate = useTranslate();

	const domainsForSite = useSelector( ( state ) => getDomainsBySiteId( state, siteId ) );
	const selectedDomain = useSelector( () =>
		getSelectedDomain( { domains: domainsForSite, selectedDomainName: selectedDomainName } )
	);

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
		( alternativeEmailFieldTouched || showAllErrors ) && null !== alternativeEmailError;
	const hasMailboxError = ( mailboxFieldTouched || showAllErrors ) && null !== mailboxError;
	const hasNameError = ( nameFieldTouched || showAllErrors ) && null !== nameError;
	const hasPasswordError = ( passwordFieldTouched || showAllErrors ) && null !== passwordError;

	const showIsAdminToggle = false;

	return (
		<>
			<div
				className={ classNames( 'titan-new-mailbox', {
					'show-labels': showLabels,
				} ) }
			>
				<div className="titan-new-mailbox__name-and-remove">
					<FormFieldset>
						<FormLabel>
							{ showLabels && translate( 'Full name' ) }
							<FormTextInput
								placeholder={ translate( 'Full name' ) }
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
								suffix={ `@${ selectedDomain?.name }` }
							/>
						</FormLabel>
						{ hasNameError && <FormInputValidation text={ nameError } isError /> }
					</FormFieldset>
				</div>
				<FormFieldset>
					<FormLabel>
						{ showLabels && translate( 'Email address' ) }
						<FormTextInputWithAffixes
							placeholder={ translate( 'Email address' ) }
							value={ mailbox }
							isError={ hasMailboxError }
							onChange={ ( event ) => {
								onMailboxValueChange( 'mailbox', event.target.value.toLowerCase() );
							} }
							onBlur={ () => {
								setMailboxFieldTouched( hasBeenValidated );
							} }
							onKeyUp={ onReturnKeyPress }
							suffix={ `@${ selectedDomain?.name }` }
						/>
					</FormLabel>
					{ hasMailboxError && <FormInputValidation text={ mailboxError } isError /> }
				</FormFieldset>
				<FormFieldset>
					<FormLabel>
						{ showLabels && translate( 'Password' ) }
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

				<FormFieldset>
					<FormLabel>
						{ showLabels &&
							translate( 'Password reset email address', {
								comment: 'This is the email address we will send password reset emails to',
							} ) }
						<FormTextInput
							placeholder={
								showLabels
									? translate( 'Email address' )
									: translate( 'Password reset email address', {
											comment: 'This is the email address we will send password reset emails to',
									  } )
							}
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
			</div>
		</>
	);
};

TitanNewMailbox.propTypes = {
	onMailboxValueChange: PropTypes.func.isRequired,
	onReturnKeyPress: PropTypes.func.isRequired,
	mailbox: getMailboxPropTypeShape(),
	showAllErrors: PropTypes.bool,
	showLabels: PropTypes.bool.isRequired,
};

export default TitanNewMailbox;
