/**
 * External dependencies
 */
import React, { useState } from 'react';
import { Button, ExternalLink, TextControl, Modal, Notice } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __experimentalCreateInterpolateElement } from '@wordpress/element';
import { useI18n } from '@automattic/react-i18n';

/**
 * Internal dependencies
 */
import { AUTH_STORE } from '../../stores/auth';
import './style.scss';

// TODO: deploy this change to @types/wordpress__element
declare module '@wordpress/element' {
	// eslint-disable-next-line no-shadow
	export function __experimentalCreateInterpolateElement(
		interpolatedString: string,
		conversionMap: Record< string, ReactElement >
	): ReactNode;
}

const LoginForm = () => {
	const { __: NO__, _x: NO_x } = useI18n();
	const [ usernameOrEmailVal, setUsernameOrEmailVal ] = useState( '' );
	const [ passwordVal, setPasswordVal ] = useState( '' );
	const { submitUsernameOrEmail } = useDispatch( AUTH_STORE );
	const { submitPassword } = useDispatch( AUTH_STORE );
	const loginFlowState = useSelect( select => select( AUTH_STORE ).getLoginFlowState() );
	const errors = useSelect( select => select( AUTH_STORE ).getErrors() );

	// todo: loading state like isFetchingNewUser

	const handleLogin = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();

		// todo: record analytics.
		if ( loginFlowState === 'ENTER_USERNAME_OR_EMAIL' ) {
			submitUsernameOrEmail( usernameOrEmailVal );
		} else if ( loginFlowState === 'ENTER_PASSWORD' ) {
			submitPassword( passwordVal );
			//todo: handle success
		}
	};

	const handleClose = () => {
		// todo
	};

	const tos = __experimentalCreateInterpolateElement(
		NO__( 'By continuing you agree to our <link_to_tos>Terms of Service</link_to_tos>.' ),
		{
			link_to_tos: <ExternalLink href="https://wordpress.com/tos/" />,
		}
	);

	// todo: may need to be updated as more states are handled
	const shouldShowPasswordField = loginFlowState === 'ENTER_PASSWORD';

	return (
		<Modal
			className="login-form"
			isDismissible={ false }
			title={ NO__( 'Log in to save your changes' ) }
			onRequestClose={ handleClose }
		>
			<form onSubmit={ handleLogin }>
				<TextControl
					label={ NO__( 'Email Address or Username' ) }
					value={ usernameOrEmailVal }
					// disabled={ isLoading }
					onChange={ setUsernameOrEmailVal }
					placeholder={ NO_x(
						'E.g., yourname@email.com',
						"An example of a person's email, use something appropriate for the locale"
					) }
					required
				/>
				<div
					className={ `login-form__password-section ${
						! shouldShowPasswordField ? 'is-hidden' : ''
					}` }
				>
					<TextControl
						label={ NO__( 'Password' ) }
						// disabled={ isLoading }
						type="password"
						value={ passwordVal }
						onChange={ setPasswordVal }
					/>
				</div>
				{ errors &&
					errors.map( ( error, i ) => (
						<Notice
							className="login-form__error-notice"
							status="error"
							isDismissible={ false }
							key={ error.code + i }
						>
							{ error.message }
						</Notice>
					) ) }
				<div className="login-form__footer">
					<p className="login-form__terms-of-service-link">{ tos }</p>

					<Button
						type="submit"
						className="login-form__submit"
						// disabled={ isLoading }
						// isBusy={ isLoading }
						isPrimary
					>
						{ NO__( 'Login' ) }
					</Button>
				</div>
			</form>
			<div className="login-form__signup-links">
				<a href="signup">
					{NO__( 'Create account.' )}
				</a>
				{/* todo: add a link to other login flow for social logins */}
			</div>
		</Modal>
	);
};

export default LoginForm;
