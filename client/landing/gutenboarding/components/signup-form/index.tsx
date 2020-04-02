/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';
import { ExternalLink, TextControl, Modal, Notice } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __experimentalCreateInterpolateElement } from '@wordpress/element';
import { useI18n } from '@automattic/react-i18n';
import { recordTracksEvent } from '@automattic/calypso-analytics';

/**
 * Internal dependencies
 */
import { USER_STORE } from '../../stores/user';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import { useLangRouteParam, usePath, Step } from '../../path';
import ModalSubmitButton from '../modal-submit-button';
import './style.scss';
import SignupFormHeader from './header';

// TODO: deploy this change to @types/wordpress__element
declare module '@wordpress/element' {
	// eslint-disable-next-line no-shadow
	export function __experimentalCreateInterpolateElement(
		interpolatedString: string,
		conversionMap: Record< string, ReactElement >
	): ReactNode;
}

interface Props {
	onRequestClose: () => void;
}

const SignupForm = ( { onRequestClose }: Props ) => {
	const { __: NO__ } = useI18n();
	const [ emailVal, setEmailVal ] = useState( '' );
	const [ passwordVal, setPasswordVal ] = useState( '' );
	const { createAccount, clearErrors } = useDispatch( USER_STORE );
	const isFetchingNewUser = useSelect( select => select( USER_STORE ).isFetchingNewUser() );
	const newUserError = useSelect( select => select( USER_STORE ).getNewUserError() );
	const { siteTitle, siteVertical } = useSelect( select => select( ONBOARD_STORE ) ).getState();
	const langParam = useLangRouteParam();
	const makePath = usePath();

	const closeModal = () => {
		clearErrors();
		onRequestClose();
	};

	useEffect( () => {
		recordTracksEvent( 'calypso_gutenboarding_signup_start', {
			flow: 'gutenboarding',
		} );
	}, [] );

	const lang = useLangRouteParam();

	const handleSignUp = async ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();

		const username_hint = siteTitle || siteVertical?.label;

		const success = await createAccount( {
			email: emailVal,
			password: passwordVal,
			signup_flow_name: 'gutenboarding',
			locale: langParam,
			...( username_hint && {
				extra: { username_hint },
			} ),
			is_passwordless: false,
		} );

		if ( success ) {
			closeModal();
		}
	};

	const tos = __experimentalCreateInterpolateElement(
		NO__( 'By creating an account you agree to our <link_to_tos>Terms of Service</link_to_tos>.' ),
		{
			link_to_tos: <ExternalLink href="https://wordpress.com/tos/" />,
		}
	);

	let errorMessage: string | undefined;
	if ( newUserError ) {
		switch ( newUserError.error ) {
			case 'already_taken':
			case 'already_active':
			case 'email_exists':
				errorMessage = NO__( 'An account with this email address already exists.' );
				break;
			case 'password_invalid':
				errorMessage = newUserError.message;
				break;
			default:
				errorMessage = NO__(
					'Sorry, something went wrong when trying to create your account. Please try again.'
				);
				break;
		}
	}

	const langFragment = lang ? `/${ lang }` : '';
	const loginRedirectUrl = `${ window.location.origin }/gutenboarding${ makePath(
		Step.CreateSite
	) }?new`;

	return (
		<Modal
			className={ 'signup-form' }
			title={ NO__( 'Save your progress' ) }
			onRequestClose={ closeModal }
			focusOnMount={ false }
			isDismissible={ false }
			overlayClassName={ 'signup-form__overlay' }
			// set to false so that 1password's autofill doesn't automatically close the modal
			shouldCloseOnClickOutside={ false }
		>
			<SignupFormHeader
				onRequestClose={ closeModal }
				loginUrl={ `/log-in/gutenboarding${ langFragment }?redirect_to=${ encodeURIComponent(
					loginRedirectUrl
				) }` }
			/>

			<div className="signup-form__body">
				<h1 className="signup-form__title">{ NO__( 'Save your progress' ) }</h1>

				<form onSubmit={ handleSignUp }>
					<fieldset>
						<legend className="signup-form__legend">
							<p>{ NO__( 'Enter an email and password to save your progress and continue' ) }</p>
						</legend>

						<TextControl
							value={ emailVal }
							disabled={ isFetchingNewUser }
							type="email"
							onChange={ setEmailVal }
							placeholder={ NO__( 'Email address' ) }
							required
							autoFocus={ true } // eslint-disable-line jsx-a11y/no-autofocus
						/>

						<TextControl
							value={ passwordVal }
							disabled={ isFetchingNewUser }
							type="password"
							onChange={ setPasswordVal }
							placeholder={ NO__( 'Password' ) }
							required
						/>

						{ errorMessage && (
							<Notice className="signup-form__error-notice" status="error" isDismissible={ false }>
								{ errorMessage }
							</Notice>
						) }

						<div className="signup-form__footer">
							<p className="signup-form__link signup-form__terms-of-service-link">{ tos }</p>

							<ModalSubmitButton disabled={ isFetchingNewUser } isBusy={ isFetchingNewUser }>
								{ NO__( 'Create account' ) }
							</ModalSubmitButton>
						</div>
					</fieldset>
				</form>
			</div>
		</Modal>
	);
};

export default SignupForm;
