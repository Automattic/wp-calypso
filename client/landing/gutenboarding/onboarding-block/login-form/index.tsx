/**
 * External dependencies
 */
import React, { useState } from 'react';
import { Button, ExternalLink, TextControl, Modal, Notice } from '@wordpress/components';
import { useDispatch, useSelect, dispatch } from '@wordpress/data';
import { __experimentalCreateInterpolateElement } from '@wordpress/element';
import { useI18n } from '@automattic/react-i18n';
/**
 * Internal dependencies
 */
import { USER_STORE } from '../../stores/user';
import './style.scss';
import { useHistory } from 'react-router-dom';

// TODO: deploy this change to @types/wordpress__element
declare module '@wordpress/element' {
	// eslint-disable-next-line no-shadow
	export function __experimentalCreateInterpolateElement(
		interpolatedString: string,
		conversionMap: Record< string, ReactElement >
	): ReactNode;
}

const SignupForm = () => {
	const { __: NO__, _x: NO_x } = useI18n();
	const [ usernameOrEmailVal, setUsernameOrEmailVal ] = useState( '' );
	const [ passwordVal, setPasswordVal ] = useState( '' );

	// dispatch action for logging in
	// some kind of loading state like isFetchingNewUser
	// useSelect to get login errors from user store

	const history = useHistory();

	let hasAccountTypeLoaded = false;

	const handleLogin = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();

		// TODO: check if the account exists and what auth method it uses

		// todo: record analytics.

		// createAccount( { email: usernameOrEmailVal, is_passwordless: true, signup_flow_name: 'gutenboarding' } );
		// Login dispatch here
	};

	const handleClose = () => {
		// work out the equivilant of this code
		// if ( shouldCreate ) {
		// 	setShouldCreate( false );
		// 	history.goBack();
		// }
	};

	const tos = __experimentalCreateInterpolateElement(
		NO__( 'By continuing you agree to our <link_to_tos>Terms of Service</link_to_tos>.' ),
		{
			link_to_tos: <ExternalLink href="https://wordpress.com/tos/" />,
		}
	);

	let errorMessage: string | undefined;

	// handle error messages like this:
	// if ( newUserError ) {
	// 	switch ( newUserError.error ) {
	// 		case 'already_taken':
	// 		case 'already_active':
	// 		case 'email_exists':
	// 			errorMessage = NO__( 'An account with this email address already exists.' );
	// 			break;

	// 		default:
	// 			errorMessage = NO__(
	// 				'Sorry, something went wrong when trying to create your account. Please try again.'
	// 			);
	// 			break;
	// 	}
	// }

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
					// todo: dissable when saving
					// disabled={ isFetchingNewUser }
					onChange={ setUsernameOrEmailVal }
					placeholder={ NO_x(
						'E.g., yourname@email.com',
						"An example of a person's email, use something appropriate for the locale"
					) }
					required
				/>

				<div
					className={ `login-form__password-section ${
						! hasAccountTypeLoaded ? 'is-hidden' : ''
					}` }
				>
					<TextControl
						label={ NO__( 'Password' ) }
						// disabled={ isFormDisabled }
						type="password"
						value={ passwordVal }
						onChange={ setPasswordVal }
					/>

					{ /* { requestError && requestError.field === 'password' && (
								<FormInputValidation isError text={ requestError.message } />
							) } */ }
				</div>
				{ errorMessage && (
					<Notice className="login-form__error-notice" status="error" isDismissible={ false }>
						{ errorMessage }
					</Notice>
				) }
				<div className="login-form__footer">
					<p className="login-form__terms-of-service-link">{ tos }</p>

					<Button
						type="submit"
						className="login-form__submit"
						// disabled={ isFetchingNewUser }
						// isBusy={ isFetchingNewUser }
						isPrimary
					>
						{ NO__( 'Login' ) }
					</Button>
				</div>
			</form>
		</Modal>
	);
};

export default SignupForm;
