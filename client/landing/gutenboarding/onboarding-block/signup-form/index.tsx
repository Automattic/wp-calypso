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
import { USER_STORE } from '../../stores/user';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import './style.scss';
import { useHistory } from 'react-router-dom';

type NewUserErrorResponse = import('@automattic/data-stores').User.NewUserErrorResponse;

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
	const [ emailVal, setEmailVal ] = useState( '' );
	const { createAccount } = useDispatch( USER_STORE );
	const { setShouldCreate } = useDispatch( ONBOARD_STORE );
	const isFetchingNewUser = useSelect( select => select( USER_STORE ).isFetchingNewUser() );
	const newUser = useSelect( select => select( USER_STORE ).getNewUser() );
	const newUserError = useSelect( select => select( USER_STORE ).getNewUserError() );
	const { shouldCreate } = useSelect( select => select( ONBOARD_STORE ) ).getState();

	const history = useHistory();

	const handleSignUp = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();

		createAccount( { email: emailVal, is_passwordless: true, signup_flow_name: 'gutenboarding' } );
	};

	const handleClose = () => {
		if ( shouldCreate ) {
			setShouldCreate( false );
			history.goBack();
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

	return (
		<Modal
			className="signup-form"
			isDismissible={ false }
			title={ NO__( 'Sign up to save your changes' ) }
			onRequestClose={ handleClose }
			focusOnMount={ false }
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

					<Button
						type="submit"
						className="signup-form__submit"
						disabled={ isFetchingNewUser }
						isBusy={ isFetchingNewUser }
						isPrimary
					>
						{ NO__( 'Create your account' ) }
					</Button>
				</div>
			</form>
			{ newUser && <pre>New user: { JSON.stringify( newUser, null, 2 ) }</pre> }
		</Modal>
	);
};

export default SignupForm;
