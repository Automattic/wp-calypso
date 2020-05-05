/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { Button, ExternalLink, Modal, Notice } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { createInterpolateElement } from '@wordpress/element';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import { AUTH_STORE } from '../../stores/auth';
import EnterUsernameOrEmailForm from './enter-username-or-email';
import EnterPasswordForm from './enter-password';
import './style.scss';

interface Props {
	onRequestClose: () => void;
	onOpenSignup: () => void;
	onLogin: ( username: string ) => void;
}

const LoginForm = ( { onRequestClose, onOpenSignup, onLogin }: Props ) => {
	const { __ } = useI18n();
	const loginFlowState = useSelect( ( select ) => select( AUTH_STORE ).getLoginFlowState() );
	const errors = useSelect( ( select ) => select( AUTH_STORE ).getErrors() );
	const { reset } = useDispatch( AUTH_STORE );

	const usernameOrEmail = useSelect( ( select ) => select( AUTH_STORE ).getUsernameOrEmail() );

	const openSignup = ( e: React.MouseEvent< HTMLElement > ) => {
		reset();
		onOpenSignup();
		e.preventDefault();
	};

	const closeModal = () => {
		reset();
		onRequestClose();
	};

	useEffect( () => {
		// this is triggered on successful submitPassword
		if ( loginFlowState === 'LOGGED_IN' ) {
			closeModal();
			onLogin( usernameOrEmail );
		}
		// todo: handle users with passwordless login.
	}, [ loginFlowState ] );

	const tos = (
		<p className="login-form__terms-of-service-link">
			{ createInterpolateElement(
				__( 'By continuing you agree to our <link_to_tos>Terms of Service</link_to_tos>.' ),
				{
					link_to_tos: <ExternalLink href="https://wordpress.com/tos/" />,
				}
			) }
		</p>
	);

	const errorNotifications = errors.map( ( error, i ) => (
		<Notice
			className="login-form__error-notice"
			status="error"
			isDismissible={ false }
			key={ error.code + i }
		>
			{ error.message }
		</Notice>
	) );
	// todo: may need to be updated as more states are handled

	return (
		<Modal
			className="login-form"
			isDismissible={ true }
			// set to false so that 1password's autofill doesn't automatically close the modal
			shouldCloseOnClickOutside={ false }
			title={ __( 'Log in to save your changes' ) }
			onRequestClose={ closeModal }
		>
			{ loginFlowState === 'ENTER_USERNAME_OR_EMAIL' && (
				<EnterUsernameOrEmailForm tos={ tos } errorNotifications={ errorNotifications } />
			) }
			{ loginFlowState === 'ENTER_PASSWORD' && (
				<EnterPasswordForm tos={ tos } errorNotifications={ errorNotifications } />
			) }

			<div className="login-form__signup-links">
				<Button isLink={ true } onClick={ openSignup }>
					{ __( 'Create account.' ) }
				</Button>
			</div>
		</Modal>
	);
};

export default LoginForm;
