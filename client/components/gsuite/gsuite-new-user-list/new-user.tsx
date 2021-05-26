/**
 * External dependencies
 */
import classNames from 'classnames';
import Gridicon from 'calypso/components/gridicon';
import React, { ChangeEvent, FunctionComponent, useState } from 'react';
import { useTranslate, TranslateResult } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import { Button } from '@automattic/components';
import GSuiteDomainsSelect from './domains-select';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormPasswordInput from 'calypso/components/forms/form-password-input';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextInputWithAffixes from 'calypso/components/forms/form-text-input-with-affixes';
import FormInputValidation from 'calypso/components/forms/form-input-validation';
import { GSuiteNewUser as NewUser } from 'calypso/lib/gsuite/new-users';

interface LabelWrapperProps {
	label: TranslateResult;
	showLabel: boolean;
}

const LabelWrapper: FunctionComponent< LabelWrapperProps > = ( { label, showLabel, children } ) => {
	if ( ! showLabel ) {
		return <>{ children }</>;
	}

	return (
		<FormLabel>
			{ label }
			{ children }
		</FormLabel>
	);
};

interface Props {
	autoFocus: boolean;
	domains: string[];
	onUserRemove: () => void;
	onUserValueChange: ( field: string, value: string ) => void;
	onReturnKeyPress: ( event: Event ) => void;
	showLabels: boolean;
	showTrashButton: boolean;
	user: NewUser;
}

const GSuiteNewUser: FunctionComponent< Props > = ( {
	autoFocus,
	domains,
	onUserRemove,
	onUserValueChange,
	onReturnKeyPress,
	user: {
		firstName: { value: firstName, error: firstNameError },
		lastName: { value: lastName, error: lastNameError },
		mailBox: { value: mailBox, error: mailBoxError },
		domain: { value: domain, error: domainError },
		password: { value: password, error: passwordError },
	},
	showLabels = false,
	showTrashButton = true,
} ) => {
	const translate = useTranslate();

	// use this to control setting the "touched" states below. That way the user will not see a bunch of
	// "This field is required" errors pop at once
	const wasValidated =
		[ firstName, lastName, mailBox, password ].some( ( value ) => '' !== value ) ||
		[ firstNameError, lastNameError, mailBoxError, passwordError, domainError ].some(
			( value ) => null !== value
		);

	const [ firstNameFieldTouched, setFirstNameFieldTouched ] = useState( false );
	const [ lastNameFieldTouched, setLastNameFieldTouched ] = useState( false );
	const [ mailBoxFieldTouched, setMailBoxFieldTouched ] = useState( false );
	const [ passwordFieldTouched, setPasswordFieldTouched ] = useState( false );

	const hasMailBoxError = mailBoxFieldTouched && null !== mailBoxError;
	const hasFirstNameError = firstNameFieldTouched && null !== firstNameError;
	const hasLastNameError = lastNameFieldTouched && null !== lastNameError;
	const hasPasswordError = passwordFieldTouched && null !== passwordError;

	const emailAddressPlaceholder = translate( 'Email' );
	const emailAddressLabel = translate( 'Email address' );

	const renderSingleDomain = () => {
		return (
			<LabelWrapper label={ emailAddressLabel } showLabel={ showLabels }>
				<FormTextInputWithAffixes
					placeholder={ emailAddressPlaceholder }
					value={ mailBox }
					isError={ hasMailBoxError }
					onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
						onUserValueChange( 'mailBox', event.target.value.toLowerCase() );
					} }
					onBlur={ () => {
						setMailBoxFieldTouched( wasValidated );
					} }
					onKeyUp={ onReturnKeyPress }
					suffix={ `@${ domain }` }
				/>
			</LabelWrapper>
		);
	};

	const renderMultiDomain = () => {
		return (
			<LabelWrapper label={ emailAddressLabel } showLabel={ showLabels }>
				<FormTextInput
					placeholder={ emailAddressPlaceholder }
					value={ mailBox }
					isError={ hasMailBoxError }
					onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
						onUserValueChange( 'mailBox', event.target.value.toLowerCase() );
					} }
					onBlur={ () => {
						setMailBoxFieldTouched( wasValidated );
					} }
					onKeyUp={ onReturnKeyPress }
				/>

				<GSuiteDomainsSelect
					domains={ domains }
					onChange={ ( event ) => {
						onUserValueChange( 'domain', event.target.value );
					} }
					value={ domain }
				/>
			</LabelWrapper>
		);
	};

	return (
		<div
			className={ classNames( 'gsuite-new-user-list__new-user', { 'show-labels': showLabels } ) }
		>
			<FormFieldset>
				<div className="gsuite-new-user-list__new-user-section">
					<div className="gsuite-new-user-list__new-user-name-container">
						<LabelWrapper label={ translate( 'First name' ) } showLabel={ showLabels }>
							<FormTextInput
								autoFocus={ autoFocus } // eslint-disable-line jsx-a11y/no-autofocus
								placeholder={ translate( 'First name' ) }
								value={ firstName }
								maxLength={ 60 }
								isError={ hasFirstNameError }
								onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
									onUserValueChange( 'firstName', event.target.value, mailBoxFieldTouched );
								} }
								onBlur={ () => {
									setFirstNameFieldTouched( wasValidated );
								} }
								onKeyUp={ onReturnKeyPress }
							/>
						</LabelWrapper>

						{ hasFirstNameError && <FormInputValidation text={ firstNameError } isError /> }
					</div>

					<div className="gsuite-new-user-list__new-user-name-container">
						<LabelWrapper label={ translate( 'Last name' ) } showLabel={ showLabels }>
							<FormTextInput
								placeholder={ translate( 'Last name' ) }
								value={ lastName }
								maxLength={ 60 }
								isError={ hasLastNameError }
								onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
									onUserValueChange( 'lastName', event.target.value );
								} }
								onBlur={ () => {
									setLastNameFieldTouched( wasValidated );
								} }
								onKeyUp={ onReturnKeyPress }
							/>
						</LabelWrapper>

						{ hasLastNameError && <FormInputValidation text={ lastNameError } isError /> }
					</div>

					{ showTrashButton && (
						<Button
							className="gsuite-new-user-list__new-user-remove-user-button"
							onClick={ onUserRemove }
						>
							<Gridicon icon="trash" />
							<span>{ translate( 'Remove user' ) }</span>
						</Button>
					) }
				</div>
			</FormFieldset>

			<FormFieldset>
				<div className="gsuite-new-user-list__new-user-section">
					<div className="gsuite-new-user-list__new-user-email-container">
						<div className="gsuite-new-user-list__new-user-email">
							{ domains.length > 1 ? renderMultiDomain() : renderSingleDomain() }
						</div>

						{ hasMailBoxError && <FormInputValidation text={ mailBoxError } isError /> }
					</div>

					<div className="gsuite-new-user-list__new-user-password-container">
						<LabelWrapper label={ translate( 'Password' ) } showLabel={ showLabels }>
							<FormPasswordInput
								autoCapitalize="off"
								autoCorrect="off"
								placeholder={ translate( 'Password' ) }
								value={ password }
								maxLength={ 100 }
								isError={ hasPasswordError }
								onChange={ ( event: ChangeEvent< HTMLInputElement > ) => {
									onUserValueChange( 'password', event.target.value );
								} }
								onBlur={ () => {
									setPasswordFieldTouched( wasValidated );
								} }
								onKeyUp={ onReturnKeyPress }
							/>
						</LabelWrapper>

						{ hasPasswordError && <FormInputValidation text={ passwordError } isError /> }
					</div>
				</div>
			</FormFieldset>
		</div>
	);
};

export default GSuiteNewUser;
