/**
 * External dependencies
 */
import React, { useState, useEffect } from 'react';
import { Button, ExternalLink, TextControl, Icon, Modal, Notice } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __experimentalCreateInterpolateElement } from '@wordpress/element';
import { useI18n } from '@automattic/react-i18n';
import { recordTracksEvent } from '@automattic/calypso-analytics';
import classnames from 'classnames';

/**
 * Internal dependencies
 */
import { USER_STORE } from '../../stores/user';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import { useLangRouteParam, usePath, Step } from '../../path';
import ModalSubmitButton from '../modal-submit-button';
import './style.scss';
import { __ } from '@wordpress/i18n';

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

interface CloseButtonProps {
	onClose: () => void;
	closeLabel?: string;
}

const CustomCloseButton = ( { onClose, closeLabel }: CloseButtonProps ) => {
	const label = closeLabel ? closeLabel : __( 'Close dialog' );
	return (
		<Button onClick={ onClose } label={ label }>
			<svg
				width="16"
				height="16"
				viewBox="0 0 16 16"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<path d="M1.40456 1L15 15M1 15L14.5954 1" stroke="#1E1E1E" stroke-width="1.5" />
			</svg>
		</Button>
	);
};

const SignupForm = ( { onRequestClose }: Props ) => {
	const { __: NO__ } = useI18n();
	const [ emailVal, setEmailVal ] = useState( '' );
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

	const modalClasses = classnames( 'signup-form', {
		'signup-form__fullscreen': true,
	} );

	return (
		<Modal
			className={ modalClasses }
			title={ NO__( 'Save your progress' ) }
			onRequestClose={ closeModal }
			focusOnMount={ false }
			isDismissible={ false }
			overlayClassName={ 'signup-form__overlay' }
			// set to false so that 1password's autofill doesn't automatically close the modal
			shouldCloseOnClickOutside={ false }
		>
			<div className="signup-form__header">
				<div className="signup-form__header-section">
					<div className="signup-form__header-section-item signup-form__header-wp-logo">
						<Icon icon="wordpress-alt" size={ 24 } />
					</div>
				</div>

				<div className="signup-form__header-section">
					<div className="signup-form__header-section-item">
						<Button
							className="signup-form__link"
							isLink
							href={ '/log-in?redirect_to=' + encodeURIComponent( loginRedirectUrl ) }
						>
							{ NO__( 'Log in' ) }
						</Button>
					</div>

					<div className="signup-form__header-section-item signup-form__header-close-button">
						<CustomCloseButton onClose={ onRequestClose } />
					</div>
				</div>
			</div>

			<main className="signup-form__body">
				<h1 className="signup-form__title">{ NO__( 'Save your progress' ) }</h1>

				<form onSubmit={ handleSignUp }>
					<fieldset>
						<legend className="signup-form__legend">
							{ NO__( 'Enter an email and password to save your progress and continue' ) }
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
						{ errorMessage && (
							<Notice className="signup-form__error-notice" status="error" isDismissible={ false }>
								{ errorMessage }
							</Notice>
						) }
						<div className="signup-form__footer">
							<p className="signup-form__terms-of-service-link">{ tos }</p>

							<ModalSubmitButton disabled={ isFetchingNewUser } isBusy={ isFetchingNewUser }>
								{ NO__( 'Create account' ) }
							</ModalSubmitButton>
						</div>
					</fieldset>
				</form>
			</main>
		</Modal>
	);
};

export default SignupForm;
