/**
 * External dependencies
 */
import React, { useState } from 'react';
import { Button, TextControl, Modal } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __ as NO__ } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { USER_STORE } from '../../stores/user';
import FormLabel from 'components/forms/form-label';
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
			title={ NO__( 'Sign up to save your changes' ) }
			onRequestClose={ () => {} }
		>
			<form onSubmit={ handleSignUp }>
				<FormLabel htmlFor="email">{ NO__( 'Your Email Address' ) }</FormLabel>
				<TextControl
					id="email"
					value={ emailVal }
					disabled={ isFetchingNewUser }
					onChange={ setEmailVal }
					placeholder={ NO__( 'yourname@email.com' ) }
				/>
				<div className="signup-form__footer">
					<p className="signup-form__terms-of-service-link">
						{ NO__( 'By creating an account you agree to our' ) } { renderTosLink() }
					</p>

					<Button
						type="submit"
						className="signup-form__submit"
						disabled={ isFetchingNewUser }
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
