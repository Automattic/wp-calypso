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
} from 'calypso/my-sites/email/form/mailboxes/constants';
import {
	getFormField,
	getFormFieldError,
	getFormFieldIsVisible,
	getFormFieldValue,
} from 'calypso/my-sites/email/form/mailboxes/field-selectors';
import {
	EmailProvider,
	FormFieldNames,
	MutableFormFieldNames,
} from 'calypso/my-sites/email/form/mailboxes/types';
import DomainSelect from 'calypso/my-sites/email/form/new-mailbox-list/domain-select';
import { useFieldsTouched } from 'calypso/my-sites/email/form/new-mailbox-list/fields-touched';
import { getCurrentUserEmail } from 'calypso/state/current-user/selectors';

interface NewMailboxProps {
	domains: string[];
	mailbox: MailboxForm< EmailProvider >;
	onMailboxValueChange: (
		field: FormFieldNames,
		value: string | boolean,
		mailBoxFieldTouched?: boolean
	) => void;
	onReturnKeyPress: ( event: Event ) => void;
	provider: EmailProvider;
	selectedDomainName: string;
	showAllErrors?: boolean;
}

interface MailboxFormFieldProps extends NewMailboxProps {
	fieldName: MutableFormFieldNames;
	isPasswordField?: boolean;
	propagateMailboxDirtyState?: boolean;
}

const getInputValue = ( event: ChangeEvent< HTMLInputElement > ) => event?.target?.value;

const useGetFieldDisplayText = ( fieldName: MutableFormFieldNames ): TranslateResult => {
	const translate = useTranslate();

	const textMap: Record< MutableFormFieldNames, TranslateResult > = {
		[ FIELD_ALTERNATIVE_EMAIL ]: translate( 'Password reset email address', {
			comment: 'This is the email address we will send password reset emails to',
		} ),
		[ FIELD_FIRSTNAME ]: translate( 'First name' ),
		[ FIELD_IS_ADMIN ]: translate( 'Is admin?' ),
		[ FIELD_LASTNAME ]: translate( 'Last name' ),
		[ FIELD_MAILBOX ]: translate( 'Email address' ),
		[ FIELD_NAME ]: translate( 'Full name' ),
		[ FIELD_PASSWORD ]: translate( 'Password' ),
	};

	return textMap[ fieldName ];
};

const useFieldHasError = (
	fieldName: MutableFormFieldNames,
	mailbox: MailboxForm< EmailProvider >,
	showAllErrors?: boolean
) => {
	const dirtyFields = useFieldsTouched();
	const formField = getFormField( mailbox, fieldName );
	const formFieldHasError = formField?.hasError() ?? false;

	return ( dirtyFields.state[ fieldName ] || showAllErrors ) && formFieldHasError;
};

const TextInput = ( {
	fieldName,
	mailbox,
	onMailboxValueChange,
	onReturnKeyPress,
	propagateMailboxDirtyState = false,
	showAllErrors,
}: MailboxFormFieldProps ): JSX.Element => {
	const fieldsTouched = useFieldsTouched();
	const hasFieldError = useFieldHasError( fieldName, mailbox, showAllErrors );
	const setFieldTouched = fieldsTouched.setFieldTouched[ fieldName ];

	return (
		<FormTextInput
			value={ getFormFieldValue( mailbox, fieldName ) }
			required
			isError={ hasFieldError }
			onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
				onMailboxValueChange(
					fieldName,
					getInputValue( event ),
					propagateMailboxDirtyState ? fieldsTouched.state.mailbox : undefined
				);
			} }
			onBlur={ () => {
				setFieldTouched( mailbox.isValid() );
			} }
			onKeyUp={ onReturnKeyPress }
		/>
	);
};

const PasswordInput = ( {
	fieldName,
	mailbox,
	onMailboxValueChange,
	onReturnKeyPress,
	showAllErrors,
}: MailboxFormFieldProps ): JSX.Element => {
	const fieldsTouched = useFieldsTouched();
	const hasFieldError = useFieldHasError( fieldName, mailbox, showAllErrors );
	const setFieldTouched = fieldsTouched.setFieldTouched[ fieldName ];

	return (
		<FormPasswordInput
			autoCapitalize="off"
			autoCorrect="off"
			value={ getFormFieldValue( mailbox, fieldName ) }
			maxLength={ 100 }
			isError={ hasFieldError }
			onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
				onMailboxValueChange( fieldName, getInputValue( event ) );
			} }
			onBlur={ () => {
				setFieldTouched( mailbox.isValid() );
			} }
			onKeyUp={ onReturnKeyPress }
		/>
	);
};

const TextField = ( props: MailboxFormFieldProps ): JSX.Element => {
	const { fieldName, isPasswordField = false, mailbox, showAllErrors } = props;

	const hasFieldError = useFieldHasError( fieldName, mailbox, showAllErrors );
	const fieldText = useGetFieldDisplayText( fieldName );

	if ( ! getFormFieldIsVisible( mailbox, fieldName ) ) {
		return <></>;
	}

	return (
		<FormFieldset>
			<FormLabel>
				{ fieldText }
				{ isPasswordField ? <PasswordInput { ...props } /> : <TextInput { ...props } /> }
			</FormLabel>
			{ hasFieldError && (
				<FormInputValidation text={ getFormFieldError( mailbox, fieldName ) } isError />
			) }
		</FormFieldset>
	);
};

const SingleDomain = ( {
	mailbox,
	onMailboxValueChange,
	onReturnKeyPress,
	selectedDomainName,
	showAllErrors,
}: NewMailboxProps ): JSX.Element => {
	const fieldsTouched = useFieldsTouched();
	const hasMailboxError = useFieldHasError( FIELD_MAILBOX, mailbox, showAllErrors );
	const fieldText = useGetFieldDisplayText( FIELD_MAILBOX );
	const isRtl = useRtl();

	return (
		<FormLabel>
			{ fieldText }
			<FormTextInputWithAffixes
				value={ getFormFieldValue( mailbox, FIELD_MAILBOX ) }
				isError={ hasMailboxError }
				onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
					onMailboxValueChange( FIELD_MAILBOX, getInputValue( event )?.toLowerCase() );
				} }
				onBlur={ () => {
					fieldsTouched.setFieldTouched.mailbox( mailbox.isValid() );
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
	const dirtyFields = useFieldsTouched();
	const fieldText = useGetFieldDisplayText( FIELD_MAILBOX );
	const hasMailboxError = useFieldHasError( FIELD_MAILBOX, mailbox, showAllErrors );

	return (
		<>
			<FormLabel>
				{ fieldText }
				<FormTextInput
					value={ getFormFieldValue( mailbox, FIELD_MAILBOX ) }
					isError={ hasMailboxError }
					onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
						onMailboxValueChange( FIELD_MAILBOX, getInputValue( event )?.toLowerCase() );
					} }
					onBlur={ () => {
						dirtyFields.setFieldTouched.mailbox( mailbox.isValid() );
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
			{ hasMailboxError && (
				<FormInputValidation text={ getFormFieldError( mailbox, FIELD_MAILBOX ) } isError />
			) }
		</>
	);
};

const NewMailbox = ( props: NewMailboxProps ): JSX.Element => {
	const translate = useTranslate();

	const [ showAlternateEmail, setShowAlternateEmail ] = useState( false );

	const userEmail = useSelector( getCurrentUserEmail );

	const dirtyFields = useFieldsTouched();

	const { domains, mailbox, onMailboxValueChange } = props;

	const showAlternateEmailField = () => {
		setShowAlternateEmail( true );
		onMailboxValueChange( FIELD_ALTERNATIVE_EMAIL, userEmail );
		dirtyFields.setFieldTouched.alternativeEmail( true );
	};

	return (
		<>
			<div className="new-mailbox">
				<div className="new-mailbox__firstname">
					<TextField
						{ ...props }
						fieldName={ FIELD_FIRSTNAME }
						propagateMailboxDirtyState={ true }
					/>
				</div>
				<div className="new-mailbox__lastname">
					<TextField
						{ ...props }
						fieldName={ FIELD_LASTNAME }
						propagateMailboxDirtyState={ true }
					/>
				</div>
				<div className="new-mailbox__mailbox">
					<FormFieldset>
						{ domains.length > 1 ? <MultipleDomain { ...props } /> : <SingleDomain { ...props } /> }
					</FormFieldset>
				</div>
				<div className="new-mailbox__password">
					<TextField { ...props } fieldName={ FIELD_PASSWORD } isPasswordField />
				</div>
				<FormFieldset>
					{ getFormFieldIsVisible( mailbox, FIELD_ALTERNATIVE_EMAIL ) && ! showAlternateEmail && (
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
				{ getFormFieldIsVisible( mailbox, FIELD_IS_ADMIN ) && (
					<FormFieldset>
						<ToggleControl
							checked={ getFormFieldValue( mailbox, FIELD_IS_ADMIN ) as boolean }
							onChange={ ( newValue ) => {
								onMailboxValueChange( 'isAdmin', newValue );
							} }
							help={ translate( 'Should this user have control panel access?' ) }
							label={ translate( 'Is admin?' ) }
						/>
					</FormFieldset>
				) }
				<div className="new-mailbox__alternative-email">
					<TextField { ...props } fieldName={ FIELD_ALTERNATIVE_EMAIL } />
				</div>
			</div>
		</>
	);
};

export default NewMailbox;
