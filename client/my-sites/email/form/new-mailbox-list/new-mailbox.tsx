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
	getFormField,
	getFormFieldError,
	getFormFieldIsRequired,
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
	submitAttempted?: boolean;
}

interface MailboxFormFieldProps extends NewMailboxProps {
	fieldName: MutableFormFieldNames;
	isPasswordField?: boolean;
	lowerCaseChangeValue?: boolean;
	propagateMailboxDirtyState?: boolean;
	textInputPrefix?: string;
	textInputSuffix?: string;
}

const getInputValue = ( event: ChangeEvent< HTMLInputElement >, lowerCaseChangeValue = false ) => {
	let value = event?.target?.value;
	if ( value && lowerCaseChangeValue ) {
		value = value.toLowerCase();
	}
	return value;
};

const mailboxHasAnyValidField = ( mailbox: MailboxForm< EmailProvider > ): boolean => {
	return ( Object.keys( mailbox.formFields ) as FormFieldNames[] )
		.filter( ( key ) => FIELD_UUID === key )
		.some( ( key ) => {
			const field = getFormField( mailbox, key );
			if ( ! field ) {
				return false;
			}

			if ( field.hasError() ) {
				return true;
			}

			return ( field.isRequired ?? false ) && field.hasValidValue();
		} );
};

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
	showAllErrors?: boolean,
	submitAttempted?: boolean
) => {
	const fieldsTouched = useFieldsTouched();

	return (
		( fieldsTouched.state[ fieldName ] || showAllErrors || submitAttempted ) &&
		getFormFieldError( mailbox, fieldName )
	);
};

const TextInput = ( {
	fieldName,
	lowerCaseChangeValue,
	mailbox,
	onMailboxValueChange,
	onReturnKeyPress,
	propagateMailboxDirtyState = false,
	showAllErrors,
	submitAttempted,
	textInputPrefix,
	textInputSuffix,
}: MailboxFormFieldProps ): JSX.Element => {
	const fieldsTouched = useFieldsTouched();
	const hasFieldError = useFieldHasError( fieldName, mailbox, showAllErrors, submitAttempted );
	const setFieldTouched = fieldsTouched.setFieldTouched[ fieldName ];

	const hasAffix = Boolean( textInputPrefix ) || Boolean( textInputSuffix );
	const FormTextComponent = hasAffix ? FormTextInputWithAffixes : FormTextInput;

	window.console.log( 'ZZZ', {
		fieldName,
		fieldValue: getFormFieldValue( mailbox, fieldName ),
		fieldError: getFormFieldError( mailbox, fieldName ),
		hasFieldError: Boolean( getFormFieldError( mailbox, fieldName ) ),
		mailboxFieldTouched: fieldsTouched.state.mailbox,
		fieldTouched: fieldsTouched.state[ fieldName ],
		submitAttempted,
	} );

	return (
		<FormTextComponent
			value={ getFormFieldValue( mailbox, fieldName ) }
			required={ getFormFieldIsRequired( mailbox, fieldName ) }
			isError={ hasFieldError }
			onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
				onMailboxValueChange(
					fieldName,
					getInputValue( event, lowerCaseChangeValue ),
					propagateMailboxDirtyState ? fieldsTouched.state.mailbox : undefined
				);
			} }
			onBlur={ () => {
				setFieldTouched( mailboxHasAnyValidField( mailbox ) );
			} }
			onKeyUp={ onReturnKeyPress }
			prefix={ textInputPrefix }
			suffix={ textInputSuffix }
		/>
	);
};

const PasswordInput = ( {
	fieldName,
	mailbox,
	onMailboxValueChange,
	onReturnKeyPress,
	showAllErrors,
	submitAttempted,
}: MailboxFormFieldProps ): JSX.Element => {
	const fieldsTouched = useFieldsTouched();
	const hasFieldError = useFieldHasError( fieldName, mailbox, showAllErrors, submitAttempted );
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
				setFieldTouched( mailboxHasAnyValidField( mailbox ) );
			} }
			onKeyUp={ onReturnKeyPress }
		/>
	);
};

const TextField = ( props: MailboxFormFieldProps ): JSX.Element => {
	const { fieldName, isPasswordField = false, mailbox, showAllErrors, submitAttempted } = props;

	const hasFieldError = useFieldHasError( fieldName, mailbox, showAllErrors, submitAttempted );
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

const SingleDomain = ( props: NewMailboxProps ): JSX.Element => {
	const { mailbox, selectedDomainName, showAllErrors, submitAttempted } = props;

	const hasMailboxError = useFieldHasError(
		FIELD_MAILBOX,
		mailbox,
		showAllErrors,
		submitAttempted
	);
	const fieldText = useGetFieldDisplayText( FIELD_MAILBOX );
	const isRtl = useRtl();

	return (
		<>
			<FormLabel>
				{ fieldText }
				<TextInput
					{ ...props }
					fieldName={ FIELD_MAILBOX }
					lowerCaseChangeValue
					propagateMailboxDirtyState={ false }
					textInputPrefix={ isRtl ? `\u200e@${ selectedDomainName }\u202c` : undefined }
					textInputSuffix={ isRtl ? undefined : `\u200e@${ selectedDomainName }\u202c` }
				/>
			</FormLabel>
			{ hasMailboxError && (
				<FormInputValidation text={ getFormFieldError( mailbox, FIELD_MAILBOX ) } isError />
			) }
		</>
	);
};

const MultipleDomain = ( props: NewMailboxProps ): JSX.Element => {
	const {
		domains,
		mailbox,
		onMailboxValueChange,
		selectedDomainName,
		showAllErrors,
		submitAttempted,
	} = props;

	const fieldText = useGetFieldDisplayText( FIELD_MAILBOX );
	const hasMailboxError = useFieldHasError(
		FIELD_MAILBOX,
		mailbox,
		showAllErrors,
		submitAttempted
	);

	return (
		<>
			<FormLabel>
				{ fieldText }
				<TextInput
					{ ...props }
					fieldName={ FIELD_MAILBOX }
					lowerCaseChangeValue
					propagateMailboxDirtyState={ false }
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

	const { domains, mailbox, onMailboxValueChange } = props;

	const [ alternativeEmailIsVisible, setAlternativeEmailIsVisible ] = useState(
		getFormFieldIsVisible( mailbox, FIELD_ALTERNATIVE_EMAIL )
	);

	const userEmail = useSelector( getCurrentUserEmail );

	const fieldsTouched = useFieldsTouched();

	mailbox.setFieldIsVisible( FIELD_ALTERNATIVE_EMAIL, alternativeEmailIsVisible );

	const displayAlternativeEmailField = () => {
		setAlternativeEmailIsVisible( true );
		onMailboxValueChange( FIELD_ALTERNATIVE_EMAIL, userEmail );
		fieldsTouched.setFieldTouched.alternativeEmail( true );
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
				<div className="new-mailbox__name">
					<TextField { ...props } fieldName={ FIELD_NAME } propagateMailboxDirtyState={ true } />
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
					{ ! alternativeEmailIsVisible && (
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
										a: <a href="#" onClick={ displayAlternativeEmailField } />,
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
