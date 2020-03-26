/**
 * External dependencies
 */
import React, { useState } from 'react';
import { Modal } from '@wordpress/components';
import { __experimentalCreateInterpolateElement } from '@wordpress/element';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import SignupForm from '../signup-form';
import LoginForm from '../login-form';
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
	handleCreateSite: () => void;
}

const AuthForm = ( { onRequestClose, handleCreateSite }: Props ) => {
	const { __: NO__ } = useI18n();
	const [ showLogin, setShowLogin ] = useState( false );
	const [ isLoading ] = useState( false ); // TODO: add loading behaviour

	const handleSignup = () => {
		setShowLogin( false );
	};

	const handleLogin = () => {
		setShowLogin( true );
	};

	return (
		<Modal
			className="auth-form"
			title={ NO__( 'Sign up to save your changes' ) }
			onRequestClose={ onRequestClose }
			focusOnMount={ false }
			isDismissible={ ! isLoading }
			// set to false so that 1password's autofill doesn't automatically close the modal
			shouldCloseOnClickOutside={ false }
		>
			{ ! showLogin && (
				<SignupForm onRequestClose={ onRequestClose } onOpenLogin={ handleLogin } />
			) }
			{ showLogin && (
				<LoginForm
					onRequestClose={ onRequestClose }
					onOpenSignup={ handleSignup }
					onLogin={ handleCreateSite }
				/>
			) }
		</Modal>
	);
};

export default AuthForm;
