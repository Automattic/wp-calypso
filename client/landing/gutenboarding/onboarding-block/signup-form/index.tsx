/**
 * External dependencies
 */
import React, { useState } from 'react';

// /**
//  * Internal dependencies
//  */
import {
	usePasswordlessSignUp,
	UsePasswordlessSignUpStatus,
	Provider,
} from '@automattic/authentication';
import { Button, TextControl, Modal } from '@wordpress/components';

import './style.scss';

const SignupForm = () => {
	const [ emailVal, setEmailVal ] = useState( '' );
	const { signUp, status, error } = usePasswordlessSignUp();

	const handleSignUp = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();
		signUp( emailVal );
	};

	const renderTosLink = () => {
		return (
			<a href="https://wordpress.com/tos/" target="_blank" rel="noopener noreferrer">
				Terms of Service
			</a>
		);
	};

	return (
		<Modal title="Sign up to save your changes" onRequestClose={ () => {} }>
			<form onSubmit={ handleSignUp }>
				<label htmlFor="email">Your Email Address</label>
				<TextControl
					id="email"
					value={ emailVal }
					onChange={ setEmailVal }
					placeholder="yourname@email.com"
				/>
				<p>By creating an account you agree to our { renderTosLink() }.</p>
				<Button
					type="submit"
					disabled={ status === UsePasswordlessSignUpStatus.Authenticating }
					isPrimary
				>
					Sign up
				</Button>
			</form>
			{ status && <p>Status: { JSON.stringify( status, null, 2 ) }</p> }
			{ error && <p>Error: { JSON.stringify( String( error ), null, 2 ) }</p> }
		</Modal>
	);
};

const WrappedSignupForm = () => {
	return (
		<Provider clientID="1673757240" clientSecret="123">
			<SignupForm />
		</Provider>
	);
};

export default WrappedSignupForm;
