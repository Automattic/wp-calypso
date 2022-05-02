import { ToggleControl } from '@wordpress/components';
import { useRtl, useTranslate } from 'i18n-calypso';
import { ChangeEvent, useState } from 'react';
import { useSelector } from 'react-redux';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import FormLabel from 'calypso/components/forms/form-label';
import FormPasswordInput from 'calypso/components/forms/form-password-input';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';
import { MailboxForm } from 'calypso/my-sites/email/form/mailboxes';
import {
	FIELD_ALTERNATIVE_EMAIL,
	FIELD_DOMAIN,
	FIELD_FIRSTNAME,
	FIELD_LASTNAME,
	FIELD_MAILBOX,
	FIELD_PASSWORD,
} from 'calypso/my-sites/email/form/mailboxes/constants';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';
import DomainSelect from 'calypso/my-sites/email/form/new-mailbox-list/domain-select';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';

interface NewMailboxProps {
	domains: string[];
	hiddenFieldNames: string[];
	mailbox: MailboxForm< EmailProvider >;
	onMailboxValueChange: ( field: string, value: unknown, mailBoxFieldTouched?: boolean ) => void;
	onReturnKeyPress: ( event: Event ) => void;
	provider: EmailProvider;
	selectedDomainName: string;
	showAllErrors?: boolean;
}

const getInputValue = ( event: ChangeEvent< HTMLInputElement > ) => event?.target?.value;

const NewMailbox = ( {
	domains,
	hiddenFieldNames,
	mailbox,
	onMailboxValueChange,
	onReturnKeyPress,
	provider,
	selectedDomainName,
	showAllErrors = true,
}: NewMailboxProps ): JSX.Element => {
	const translate = useTranslate();
	const isRtl = useRtl();

	const hasBeenValidated = mailbox.isValid();

	const [ alternativeEmailFieldTouched, setAlternativeEmailFieldTouched ] = useState( false );
	const [ mailboxFieldTouched, setMailboxFieldTouched ] = useState( false );
	const [ firstNameFieldTouched, setFirstNameFieldTouched ] = useState( false );
	const [ lastNameFieldTouched, setLastNameFieldTouched ] = useState( false );
	const [ passwordFieldTouched, setPasswordFieldTouched ] = useState( false );
	const [ showAlternateEmail, setShowAlternateEmail ] = useState( false );

	const userEmail = useSelector( getCurrentUserEmail );

	const hasAlternativeEmailError =
		( alternativeEmailFieldTouched || showAllErrors ) &&
		null !== alternativeEmailError &&
		! hiddenFieldNames.includes( FIELD_ALTERNATIVE_EMAIL );
	const hasMailboxError = ( mailboxFieldTouched || showAllErrors ) && null !== mailboxError;
	const hasFirstnameError =
		( firstNameFieldTouched || showAllErrors ) &&
		null !== firstNameError &&
		! hiddenFieldNames.includes( FIELD_FIRSTNAME );
	const hasLastnameError =
		( lastNameFieldTouched || showAllErrors ) &&
		null !== lastNameError &&
		! hiddenFieldNames.includes( FIELD_LASTNAME );
	const hasPasswordError = ( passwordFieldTouched || showAllErrors ) && null !== passwordError;

	const showIsAdminToggle = false;

	const showAlternateEmailField = () => {
		setShowAlternateEmail( true );
		onMailboxValueChange( 'alternativeEmail', userEmail );
		setAlternativeEmailFieldTouched( true );
	};

	const emailAddressText = translate( 'Email address' );

	const renderSingleDomain = () => (
		<FormLabel>
			{ emailAddressText }
			<FormTextInputWithAffixes
				value={ mailbox }
				isError={ hasMailboxError }
				onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
					onMailboxValueChange( FIELD_MAILBOX, getInputValue( event )?.toLowerCase() );
				} }
				onBlur={ () => {
					setMailboxFieldTouched( hasBeenValidated );
				} }
				onKeyUp={ onReturnKeyPress }
				prefix={ isRtl ? `\u200e@${ selectedDomainName }\u202c` : null }
				suffix={ isRtl ? null : `\u200e@${ selectedDomainName }\u202c` }
			/>
		</FormLabel>
	);

	const renderMultipleDomain = () => (
		<FormLabel>
			{ emailAddressText }
			<FormTextInput
				value={ mailbox }
				isError={ hasMailboxError }
				onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
					onMailboxValueChange( FIELD_MAILBOX, getInputValue( event )?.toLowerCase() );
				} }
				onBlur={ () => {
					setMailboxFieldTouched( hasBeenValidated );
				} }
				onKeyUp={ onReturnKeyPress }
			/>

			<DomainSelect
				domains={ domains }
				onChange={ ( event ) => {
					onMailboxValueChange( FIELD_DOMAIN, getInputValue( event ) );
				} }
				value={ selectedDomainName }
			/>
		</FormLabel>
	);

	const isTitan = provider === EmailProvider.Titan;
	const firstNameText = isTitan ? translate( 'Full name' ) : translate( 'First name' );
	// Always hide the last name for Titan
	if ( isTitan ) {
		hiddenFieldNames.push( FIELD_LASTNAME );
	}

	return (
		<>
			<div className="new-mailbox">
				{ ! hiddenFieldNames.includes( FIELD_FIRSTNAME ) && (
					<div className="new-mailbox__firstname-and-remove">
						<FormFieldset>
							<FormLabel>
								{ firstNameText }
								<FormTextInput
									value={ firstName }
									required
									isError={ hasFirstnameError }
									onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
										onMailboxValueChange(
											FIELD_FIRSTNAME,
											getInputValue( event ),
											mailboxFieldTouched
										);
									} }
									onBlur={ () => {
										setFirstNameFieldTouched( hasBeenValidated );
									} }
									onKeyUp={ onReturnKeyPress }
								/>
							</FormLabel>
							{ hasFirstnameError && <FormInputValidation text={ firstNameError } isError /> }
						</FormFieldset>
					</div>
				) }
				{ ! hiddenFieldNames.includes( FIELD_LASTNAME ) && (
					<div className="new-mailbox__lastname-and-remove">
						<FormFieldset>
							<FormLabel>
								{ translate( 'Last name' ) }
								<FormTextInput
									value={ lastName }
									required
									isError={ hasLastnameError }
									onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
										onMailboxValueChange(
											FIELD_LASTNAME,
											getInputValue( event ),
											mailboxFieldTouched
										);
									} }
									onBlur={ () => {
										setLastNameFieldTouched( hasBeenValidated );
									} }
									onKeyUp={ onReturnKeyPress }
								/>
							</FormLabel>
							{ hasLastnameError && <FormInputValidation text={ lastNameError } isError /> }
						</FormFieldset>
					</div>
				) }
				<FormFieldset>
					{ domains.length > 1 ? renderMultipleDomain() : renderSingleDomain() }
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
							onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
								onMailboxValueChange( FIELD_PASSWORD, getInputValue( event ) );
							} }
							onBlur={ () => {
								setPasswordFieldTouched( hasBeenValidated );
							} }
							onKeyUp={ onReturnKeyPress }
						/>
					</FormLabel>
					{ hasPasswordError && <FormInputValidation text={ passwordError } isError /> }
					{ hiddenFieldNames.includes( FIELD_ALTERNATIVE_EMAIL ) && ! showAlternateEmail && (
						<FormSettingExplanation>
							{ translate(
								'Your password reset email is {{strong}}%(userEmail)s{{/strong}}. {{a}}Change it{{/a}}.',
								{
									args: {
										userEmail,
									},
									components: {
										strong: <strong />,
										// eslint-disable-next-line jsx-a11y/anchor-is-valid
										a: <a href="#" onClick={ showAlternateEmailField } />,
									},
								}
							) }
						</FormSettingExplanation>
					) }
				</FormFieldset>
				{ showIsAdminToggle && (
					<FormFieldset>
						<ToggleControl
							checked={ isAdmin as boolean }
							onChange={ ( newValue ) => {
								onMailboxValueChange( 'isAdmin', newValue );
							} }
							help={ translate( 'Should this user have control panel access?' ) }
							label={ translate( 'Is admin?' ) }
						/>
					</FormFieldset>
				) }
				{ ( ! hiddenFieldNames.includes( FIELD_ALTERNATIVE_EMAIL ) || showAlternateEmail ) && (
					<FormFieldset>
						<FormLabel>
							{ translate( 'Password reset email address', {
								comment: 'This is the email address we will send password reset emails to',
							} ) }
							<FormTextInput
								value={ alternativeEmail }
								isError={ hasAlternativeEmailError }
								onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
									onMailboxValueChange( 'alternativeEmail', getInputValue( event ) );
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

export default NewMailbox;
