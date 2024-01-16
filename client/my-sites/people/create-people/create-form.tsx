import config from '@automattic/calypso-config';
import { Button, FormInputValidation } from '@automattic/components';
import { localizeUrl } from '@automattic/i18n-utils';
import { suggestEmailCorrection } from '@automattic/onboarding';
import { useState } from '@wordpress/element';
import emailValidator from 'email-validator';
import { useTranslate } from 'i18n-calypso';
import { useDebouncedCallback } from 'use-debounce';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormLabel from 'calypso/components/forms/form-label';
import FormPasswordInput from 'calypso/components/forms/form-password-input';
import FormTextInput from 'calypso/components/forms/form-text-input';
import FormTextarea from 'calypso/components/forms/form-textarea';
import { getLocaleSlug } from 'calypso/lib/i18n-utils';
import wpcom from 'calypso/lib/wp';
import RoleSelect from 'calypso/my-sites/people/role-select';
import ValidationFieldset from 'calypso/signup/validation-fieldset';
import { useSelector } from 'calypso/state';
import isSiteAutomatedTransfer from 'calypso/state/selectors/is-site-automated-transfer';
import { useInitialRole, useIncludeFollowers } from '../shared/hooks';
import type { ChangeEvent, FormEvent } from 'react';

interface CreateFormProps {
	siteId: number;
}

const CreateForm = ( { siteId }: CreateFormProps ) => {
	const translate = useTranslate();
	const defaultUserRole = useInitialRole( siteId );
	const includeFollowers = useIncludeFollowers( siteId );

	const isAtomic = useSelector( ( state ) => isSiteAutomatedTransfer( state, siteId ) );

	const includeSubscribers = isAtomic;

	const [ role, setRole ] = useState( defaultUserRole );
	const [ showMsg, setShowMsg ] = useState( false );
	const [ message, setMessage ] = useState( '' );
	const [ formState, setFormState ] = useState( {
		email: '',
		username: '',
		password: '',
		firstName: '',
		lastName: '',
	} );
	const [ errorMessages, setErrorMessages ] = useState( null );
	const [ submitting, setSubmitting ] = useState( false );

	const onFormSubmit = async ( e: FormEvent ) => {
		e.preventDefault();
		setSubmitting( true );

		console.log( " config( 'wpcom_signup_id' )", config( 'wpcom_signup_id' ) );

		try {
			const response = await wpcom.req.post( '/users/new', {
				...formState,
				validate: false,
				locale: getLocaleSlug(),
				client_id: config( 'wpcom_signup_id' ),
				client_secret: config( 'wpcom_signup_key' ),
				send_verification_email: true,
			} );
			console.log( 'response', response );
		} catch ( err ) {
			console.log( 'err', err );
		}

		console.log( 'SUBMIT' );
		setSubmitting( false );
	};

	const handleAcceptDomainSuggestion = ( newEmail, newDomain, oldDomain ) => {
		setFormState( {
			...formState,
			email: newEmail,
		} );

		setErrorMessages( null );
		// this.props.recordTracksEvent( 'calypso_signup_domain_suggestion_confirmation', {
		// 	original_domain: JSON.stringify( oldDomain ),
		// 	suggested_domain: JSON.stringify( newDomain ),
		// } );
	};

	const handleEmailDomainSuggestionError = ( newEmail, oldEmail, newDomain, oldDomain ) => {
		// this.props.recordTracksEvent( 'calypso_signup_domain_suggestion_generated', {
		// 	original_domain: JSON.stringify( oldDomain ),
		// 	suggested_domain: JSON.stringify( newDomain ),
		// } );
		setErrorMessages( [
			translate( 'Did you mean {{emailSuggestion/}}?', {
				components: {
					emailSuggestion: (
						<Button
							plain={ true }
							className="signup-form__domain-suggestion-confirmation"
							onClick={ () => {
								handleAcceptDomainSuggestion( newEmail, newDomain, oldDomain );
							} }
						>
							{ newEmail }
						</Button>
					),
				},
			} ),
		] );
	};

	const [ debouncedEmailSuggestion ] = useDebouncedCallback( ( email ) => {
		if ( emailValidator.validate( email ) ) {
			const { newEmail, oldEmail, newDomain, oldDomain, wasCorrected } =
				suggestEmailCorrection( email );
			if ( wasCorrected ) {
				handleEmailDomainSuggestionError( newEmail, oldEmail, newDomain, oldDomain );
				return;
			}
		}
	}, 1000 );

	const onEmailInputChange = ( { target: { value } } ) => {
		debouncedEmailSuggestion( value );

		setFormState( {
			...formState,
			email: value,
		} );
		setErrorMessages( null );
	};

	const handleInputChange = ( { target: { name, value } } ) => {
		setFormState( {
			...formState,
			[ name ]: value,
		} );
	};

	function getRoleLearnMoreLink() {
		return (
			<Button
				plain={ true }
				target="_blank"
				href={ localizeUrl( 'https://wordpress.com/support/user-roles/' ) }
			>
				{ translate( 'Learn more' ) }
			</Button>
		);
	}

	return (
		<form onSubmit={ onFormSubmit }>
			<RoleSelect
				id="role"
				name="role"
				siteId={ siteId }
				onChange={ ( e: ChangeEvent< HTMLSelectElement > ) => setRole( e.target.value ) }
				value={ role }
				disabled={ false }
				includeFollower={ includeFollowers }
				includeSubscriber={ includeSubscribers }
				explanation={ getRoleLearnMoreLink() }
				formControlType="select"
			/>

			<FormLabel htmlFor="username">{ translate( 'Username' ) }</FormLabel>
			<FormTextInput
				autoCapitalize="off"
				autoCorrect="off"
				className="signup-form__input"
				disabled={ submitting }
				id="username"
				name="username"
				value={ formState.username }
				// isError={ formState.isFieldInvalid( this.state.form, 'username' ) }
				// isValid={ formState.isFieldValid( this.state.form, 'username' ) }
				// onBlur={ this.handleBlur }
				onChange={ handleInputChange }
			/>

			<ValidationFieldset errorMessages={ errorMessages }>
				<FormLabel htmlFor="email">{ translate( 'Email' ) }</FormLabel>
				<FormTextInput
					// eslint-disable-next-line jsx-a11y/no-autofocus
					autoFocus
					autoCapitalize="off"
					autoCorrect="off"
					id="email"
					type="email"
					disabled={ submitting }
					value={ formState.email }
					placeholder={ translate( 'Email' ) }
					onChange={ onEmailInputChange }
				/>
			</ValidationFieldset>

			<FormLabel htmlFor="password">{ translate( 'Choose a password' ) }</FormLabel>
			<FormPasswordInput
				className="signup-form__input"
				disabled={ submitting }
				id="password"
				name="password"
				value={ formState.password }
				// isError={ formState.isFieldInvalid( this.state.form, 'password' ) }
				// isValid={ formState.isFieldValid( this.state.form, 'password' ) }
				// onBlur={ this.handleBlur }
				onChange={ handleInputChange }
				submitting={ submitting }
			/>

			<FormLabel htmlFor="firstName">{ translate( 'First name' ) }</FormLabel>
			<FormTextInput
				autoCorrect="off"
				className="signup-form__input"
				disabled={ submitting }
				id="firstName"
				name="firstName"
				value={ formState.firstName }
				// isError={ formState.isFieldInvalid( this.state.form, 'firstName' ) }
				// isValid={ formState.isFieldValid( this.state.form, 'firstName' ) }
				// onBlur={ this.handleBlur }
				onChange={ handleInputChange }
			/>
			{ /* 
			{ formState.isFieldInvalid( this.state.form, 'firstName' ) && (
				<FormInputValidation isError text={ this.getErrorMessagesWithLogin( 'firstName' ) } />
			) } */ }

			<FormLabel htmlFor="lastName">{ translate( 'Last name' ) }</FormLabel>
			<FormTextInput
				autoCorrect="off"
				className="signup-form__input"
				disabled={ submitting }
				id="lastName"
				name="lastName"
				value={ formState.lastName }
				// isError={ formState.isFieldInvalid( this.state.form, 'lastName' ) }
				// isValid={ formState.isFieldValid( this.state.form, 'lastName' ) }
				// onBlur={ this.handleBlur }
				onChange={ handleInputChange }
			/>

			{ /* { formState.isFieldInvalid( this.state.form, 'lastName' ) && (
				<FormInputValidation isError text={ this.getErrorMessagesWithLogin( 'lastName' ) } />
			) } */ }

			<FormFieldset>
				{ ! showMsg && (
					<Button
						className="team-invite-form__add-message"
						primary={ true }
						borderless={ true }
						onClick={ () => setShowMsg( true ) }
					>
						{ translate( '+ Add a message' ) }
					</Button>
				) }
				{ showMsg && (
					<>
						<FormLabel htmlFor="message">{ translate( 'Message' ) }</FormLabel>
						<FormTextarea
							// eslint-disable-next-line jsx-a11y/no-autofocus
							autoFocus
							id="message"
							value={ message }
							placeholder={ translate( 'This message will be sent to the new created user.' ) }
							onChange={ ( e: ChangeEvent< HTMLInputElement > ) => setMessage( e.target.value ) }
						/>
					</>
				) }
			</FormFieldset>
			<Button
				type="submit"
				primary
				// busy={ invitingProgress }
				className="team-invite-form__submit-btn"
			>
				{ translate( 'Create user' ) }
			</Button>
		</form>
	);
};

export default CreateForm;
