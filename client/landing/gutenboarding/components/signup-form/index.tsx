/**
 * External dependencies
 */
import React, { useState } from 'react';
import { Button, ExternalLink, TextControl, Modal, Notice } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import { USER_STORE } from '../../stores/user';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import { useLangRouteParam, usePath, Step, useCurrentStep } from '../../path';
import ModalSubmitButton from '../modal-submit-button';
import './style.scss';
import SignupFormHeader from './header';
import GUTENBOARDING_BASE_NAME from '../../basename.json';
import { recordOnboardingError } from '../../lib/analytics';
import { localizeUrl } from '../../../../lib/i18n-utils';
import { useTrackModal } from '../../hooks/use-track-modal';

interface Props {
	onRequestClose: () => void;
}

const SignupForm = ( { onRequestClose }: Props ) => {
	const { __ } = useI18n();
	const [ emailVal, setEmailVal ] = useState( '' );
	const [ passwordVal, setPasswordVal ] = useState( '' );
	const { createAccount, clearErrors } = useDispatch( USER_STORE );
	const isFetchingNewUser = useSelect( ( select ) => select( USER_STORE ).isFetchingNewUser() );
	const newUserError = useSelect( ( select ) => select( USER_STORE ).getNewUserError() );
	const { siteTitle, siteVertical } = useSelect( ( select ) => select( ONBOARD_STORE ) ).getState();
	const langParam = useLangRouteParam();
	const makePath = usePath();
	const currentStep = useCurrentStep();

	const closeModal = () => {
		clearErrors();
		onRequestClose();
	};

	useTrackModal( 'Signup' );

	const lang = useLangRouteParam();

	const handleSignUp = async ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();

		const username_hint = siteTitle || siteVertical?.label;

		const result = await createAccount( {
			email: emailVal,
			password: passwordVal,
			signup_flow_name: 'gutenboarding',
			locale: langParam,
			...( username_hint && {
				extra: { username_hint },
			} ),
			is_passwordless: false,
		} );

		if ( result.ok ) {
			closeModal();
		} else {
			recordOnboardingError( {
				step: 'account_creation',
				error: result.newUserError.error || 'signup_form_new_user_error',
			} );
		}
	};

	const localizedTosLink = localizeUrl( 'https://wordpress.com/tos/' );

	const tos = createInterpolateElement(
		__( 'By creating an account you agree to our <link_to_tos>Terms of Service</link_to_tos>.' ),
		{
			link_to_tos: <ExternalLink href={ localizedTosLink } />,
		}
	);

	let errorMessage: string | undefined;
	if ( newUserError ) {
		switch ( newUserError.error ) {
			case 'already_taken':
			case 'already_active':
			case 'email_exists':
				errorMessage = __( 'An account with this email address already exists.' );
				break;
			case 'password_invalid':
				errorMessage = newUserError.message;
				break;
			default:
				errorMessage = __(
					'Sorry, something went wrong when trying to create your account. Please try again.'
				);
				break;
		}
	}

	const langFragment = lang ? `/${ lang }` : '';
	const loginRedirectUrl = encodeURIComponent(
		`${ window.location.origin }/${ GUTENBOARDING_BASE_NAME }${ makePath( Step[ currentStep ] ) }`
	);
	const signupUrl = encodeURIComponent(
		`/${ GUTENBOARDING_BASE_NAME }${ makePath( Step[ currentStep ] ) }?signup`
	);
	const loginUrl = `/log-in/${ GUTENBOARDING_BASE_NAME }${ langFragment }?redirect_to=${ loginRedirectUrl }&signup_url=${ signupUrl }`;

	return (
		<Modal
			className={ 'signup-form' }
			title={ __( 'Save your progress' ) }
			onRequestClose={ closeModal }
			focusOnMount={ false }
			isDismissible={ false }
			overlayClassName={ 'signup-form__overlay' }
			// set to false so that 1password's autofill doesn't automatically close the modal
			shouldCloseOnClickOutside={ false }
		>
			<SignupFormHeader onRequestClose={ closeModal } />

			<div className="signup-form__body">
				<h1 className="signup-form__title">{ __( 'Save your progress' ) }</h1>

				<form onSubmit={ handleSignUp }>
					<fieldset>
						<legend className="signup-form__legend">
							<p>{ __( 'Enter an email and password to save your progress and continue.' ) }</p>
						</legend>

						<TextControl
							value={ emailVal }
							disabled={ isFetchingNewUser }
							type="email"
							onChange={ setEmailVal }
							placeholder={ __( 'Email address' ) }
							required
							autoFocus={ true } // eslint-disable-line jsx-a11y/no-autofocus
						/>

						<TextControl
							value={ passwordVal }
							disabled={ isFetchingNewUser }
							type="password"
							onChange={ setPasswordVal }
							placeholder={ __( 'Password' ) }
							required
						/>

						{ errorMessage && (
							<Notice className="signup-form__error-notice" status="error" isDismissible={ false }>
								{ errorMessage }
							</Notice>
						) }

						<div className="signup-form__footer">
							<p className="signup-form__login-link">
								<span>{ __( 'Already have an account?' ) }</span>{ ' ' }
								<Button className="signup-form__link" isLink href={ loginUrl }>
									{ __( 'Log in' ) }
								</Button>
							</p>

							<ModalSubmitButton disabled={ isFetchingNewUser } isBusy={ isFetchingNewUser }>
								{ __( 'Create account' ) }
							</ModalSubmitButton>

							<p className="signup-form__link signup-form__terms-of-service-link">{ tos }</p>
						</div>
					</fieldset>
				</form>
			</div>
		</Modal>
	);
};

export default SignupForm;
