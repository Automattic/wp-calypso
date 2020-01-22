/**
 * External dependencies
 */
import { noop } from 'lodash';
import React, { useState } from 'react';
import { Button, TextControl, Modal } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ as NO__, _x as NO_x } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { USER_STORE } from '../../stores/user';
import './style.scss';

const SignupForm = () => {
	const [ emailVal, setEmailVal ] = useState( '' );
	const { createAccount } = useDispatch( USER_STORE );
	const isFetchingNewUser = useSelect( select => select( USER_STORE ).isFetchingNewUser() );
	const newUserError = useSelect( select => select( USER_STORE ).getNewUserError() );

	const handleSignUp = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();

		createAccount( { email: emailVal, is_passwordless: true, signup_flow_name: 'gutenboarding' } );
	};

	const renderTosLink = () => {
		return (
			<a href="https://wordpress.com/tos/" target="_blank" rel="noopener noreferrer">
				{ NO__( 'Terms of Service.' ) }
			</a>
		);
	};

	return (
		<Modal
			className="signup-form"
			isDismissible={ false }
			title={ NO__( 'Sign up to save your changes' ) }
			onRequestClose={ noop }
		>
			<form onSubmit={ handleSignUp }>
				<TextControl
					label={ NO__( 'Your Email Address' ) }
					value={ emailVal }
					disabled={ isFetchingNewUser }
					onChange={ setEmailVal }
					placeholder={ NO_x(
						'E.g., yourname@email.com',
						"An example of a person's email, use something appropriate for the locale"
					) }
				/>
				<div className="signup-form__footer">
					<p className="signup-form__terms-of-service-link">
						{ NO__( 'By creating an account you agree to our' ) } { renderTosLink() }
					</p>

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
			{ newUserError && <pre>Error: { JSON.stringify( newUserError, null, 2 ) }</pre> }
		</Modal>
	);
};

export default SignupForm;
