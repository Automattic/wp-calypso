import { ToggleControl } from '@wordpress/components';
import { TranslateResult, useRtl, useTranslate } from 'i18n-calypso';
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
	FIELD_IS_ADMIN,
	FIELD_LASTNAME,
	FIELD_MAILBOX,
	FIELD_NAME,
	FIELD_PASSWORD,
	FIELD_UUID,
} from 'calypso/my-sites/email/form/mailboxes/constants';
import {
	EmailProvider,
	FormFieldNames,
	GoogleMailboxFormFields,
	TitanMailboxFormFields,
} from 'calypso/my-sites/email/form/mailboxes/types';
import DomainSelect from 'calypso/my-sites/email/form/new-mailbox-list/domain-select';
import { useFieldsDirty } from 'calypso/my-sites/email/form/new-mailbox-list/fields-dirty';
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

interface MailboxFieldProps {
	fieldName: FormFieldNames;
	mailbox: MailboxForm< EmailProvider >;
	onReturnKeyPress: ( event: Event ) => void;
	showAllErrors?: boolean;
}

const getInputValue = ( event: ChangeEvent< HTMLInputElement > ) => event?.target?.value;

const useFieldDisplayText = (
	fieldName: Exclude< FormFieldNames, typeof FIELD_DOMAIN | typeof FIELD_UUID >
) => {
	const translate = useTranslate();

	return {
		[ FIELD_ALTERNATIVE_EMAIL ]: translate( 'Password reset email address', {
			comment: 'This is the email address we will send password reset emails to',
		} ),
		[ FIELD_FIRSTNAME ]: 1,
		[ FIELD_IS_ADMIN ]: 1,
		[ FIELD_LASTNAME ]: 1,
		[ FIELD_MAILBOX ]: 1,
		[ FIELD_NAME ]: 1,
		[ FIELD_PASSWORD ]: 1,
	}[ fieldName ];
};

const useFieldHasError = (
	fieldName: FormFieldNames,
	mailbox: MailboxForm< EmailProvider >,
	showAllErrors?: boolean
) => {
	const dirtyFields = useFieldsDirty();
	const formFields: GoogleMailboxFormFields | TitanMailboxFormFields = mailbox.formFields;
	const formField = Reflect.get( formFields, fieldName );
	const formFieldHasError = formField?.hasError() ?? false;

	return ( dirtyFields.state[ fieldName ] || showAllErrors ) && formFieldHasError;
};

const Field = ( {
	fieldName,
	mailbox,
	onReturnKeyPress,
	showAllErrors = true,
}: MailboxFieldProps ): JSX.Element => {
	const dirtyFields = useFieldsDirty();
	const hasMailboxError = useFieldHasError( fieldName, mailbox, showAllErrors );

	return (
		<>
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
		</>
	);
};

const SingleDomain = ( {
	mailbox,
	onMailboxValueChange,
	onReturnKeyPress,
	selectedDomainName,
	showAllErrors,
}: NewMailboxProps ): JSX.Element => {
	const isRtl = useRtl();
	const translate = useTranslate();
	const dirtyFields = useFieldsDirty();
	const hasMailboxError = useFieldHasError( FIELD_MAILBOX, mailbox, showAllErrors );

	return (
		<FormLabel>
			{ translate( 'Email address' ) }
			<FormTextInputWithAffixes
				value={ mailbox }
				isError={ hasMailboxError }
				onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
					onMailboxValueChange( FIELD_MAILBOX, getInputValue( event )?.toLowerCase() );
				} }
				onBlur={ () => {
					dirtyFields.actions.setMailboxFieldDirty( mailbox.isValid() );
				} }
				onKeyUp={ onReturnKeyPress }
				prefix={ isRtl ? `\u200e@${ selectedDomainName }\u202c` : null }
				suffix={ isRtl ? null : `\u200e@${ selectedDomainName }\u202c` }
			/>
		</FormLabel>
	);
};

const MultipleDomain = ( {
	domains,
	mailbox,
	onMailboxValueChange,
	onReturnKeyPress,
	selectedDomainName,
	showAllErrors,
}: NewMailboxProps ): JSX.Element => {
	const translate = useTranslate();
	const dirtyFields = useFieldsDirty();
	const hasMailboxError = useFieldHasError( FIELD_MAILBOX, mailbox, showAllErrors );

	return (
		<FormLabel>
			{ translate( 'Email address' ) }
			<FormTextInput
				value={ mailbox }
				isError={ hasMailboxError }
				onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
					onMailboxValueChange( FIELD_MAILBOX, getInputValue( event )?.toLowerCase() );
				} }
				onBlur={ () => {
					dirtyFields.actions.setMailboxFieldDirty( mailbox.isValid() );
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
};

const NewMailbox = ( props: NewMailboxProps ): JSX.Element => {
	const {
		domains,
		hiddenFieldNames,
		mailbox,
		onMailboxValueChange,
		onReturnKeyPress,
		provider,
		showAllErrors = true,
	} = props;

	const translate = useTranslate();

	const hasBeenValidated = mailbox.isValid();

	const [ alternativeEmailFieldTouched, setAlternativeEmailFieldTouched ] = useState( false );

	const [ firstNameFieldTouched, setFirstNameFieldTouched ] = useState( false );
	const [ lastNameFieldTouched, setLastNameFieldTouched ] = useState( false );
	const [ passwordFieldTouched, setPasswordFieldTouched ] = useState( false );
	const [ showAlternateEmail, setShowAlternateEmail ] = useState( false );

	const userEmail = useSelector( getCurrentUserEmail );

	const hasAlternativeEmailError =
		( alternativeEmailFieldTouched || showAllErrors ) &&
		mailbox.hasErrors() &&
		! hiddenFieldNames.includes( FIELD_ALTERNATIVE_EMAIL );

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
					{ domains.length > 1 ? <MultipleDomain { ...props } /> : <SingleDomain { ...props } /> }
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
