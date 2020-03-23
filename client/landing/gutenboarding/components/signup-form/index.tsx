/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';
import { Button, ExternalLink, TextControl, Modal, Notice } from '@wordpress/components';
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
	onOpenLogin: () => void;
}

const SignupForm = ( { onRequestClose, onOpenLogin }: Props ) => {
	const { __: NO__, _x: NO_x } = useI18n();
	const [ emailVal, setEmailVal ] = useState( '' );
	const { createAccount } = useDispatch( USER_STORE );
	const isFetchingNewUser = useSelect( select => select( USER_STORE ).isFetchingNewUser() );
	const newUserError = useSelect( select => select( USER_STORE ).getNewUserError() );
	const { siteTitle, siteVertical } = useSelect( select => select( ONBOARD_STORE ) ).getState();
	const langParam = useLangRouteParam();
	const makePath = usePath();

	useEffect( () => {
		recordTracksEvent( 'calypso_gutenboarding_signup_start', {
			flow: 'gutenboarding',
		} );
	}, [] );

	const handleSignUp = async ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();

		const username_hint = siteTitle || siteVertical?.label;

		const success = await createAccount( {
			email: emailVal,
			is_passwordless: true,
			signup_flow_name: 'gutenboarding',
			locale: langParam,
			...( username_hint && {
				extra: { username_hint },
			} ),
		} );

		if ( success ) {
			onRequestClose();
		}
	};

	const openLogin = ( e: React.MouseEvent< HTMLElement > ) => {
		onOpenLogin();
		e.preventDefault();
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

			default:
				errorMessage = NO__(
					'Sorry, something went wrong when trying to create your account. Please try again.'
				);
				break;
		}
	}

	const loginRedirectUrl = `${ window.location.origin }/gutenboarding${ makePath(
		Step.CreateSite
	) }?new`;

	return (
		<Modal
			className="signup-form"
			title={ NO__( 'Sign up to save your changes' ) }
			onRequestClose={ onRequestClose }
			focusOnMount={ false }
			isDismissible={ ! isFetchingNewUser }
			// set to false so that 1password's autofill doesn't automatically close the modal
			shouldCloseOnClickOutside={ false }
		>
			<form onSubmit={ handleSignUp }>
				<TextControl
					label={ NO__( 'Your Email Address' ) }
					value={ emailVal }
					disabled={ isFetchingNewUser }
					type="email"
					onChange={ setEmailVal }
					placeholder={ NO_x(
						'E.g., yourname@email.com',
						"An example of a person's email, use something appropriate for the locale"
					) }
					required
					autoFocus={ true } // eslint-disable-line jsx-a11y/no-autofocus
				/>
				{ errorMessage && (
					<Notice className="signup-form__error-notice" status="error" isDismissible={ false }>
						{ errorMessage }
					</Notice>
				) }
				<div className="signup-form__footer">
					<p className="signup-form__terms-of-service-link">{ tos }</p>

					<ModalSubmitButton disabled={ isFetchingNewUser } isBusy={ isFetchingNewUser }>
						{ NO__( 'Create your account' ) }
					</ModalSubmitButton>
				</div>
			</form>
			<div className="signup-form__login-links">
				<Button isLink href={ '/log-in?redirect_to=' + encodeURIComponent( loginRedirectUrl ) }>
					{ NO__( 'Log in to create a site for your existing account.' ) }
				</Button>
			</div>
			<div className="signup-form__login-links">
				<Button isLink={ true } onClick={ openLogin }>
					{ /* Removing before shipping, no need to translate */ }
					(experimental login)
				</Button>
			</div>
		</Modal>
	);
};

export default SignupForm;
