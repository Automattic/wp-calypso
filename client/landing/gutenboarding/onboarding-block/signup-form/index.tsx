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
	Client,
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
		<Modal className="signup-form" title="Sign up to save your changes" onRequestClose={ () => {} }>
			<form onSubmit={ handleSignUp }>
				<label htmlFor="email">Your Email Address</label>
				<TextControl
					id="email"
					value={ emailVal }
					onChange={ setEmailVal }
					placeholder="yourname@email.com"
				/>
				<div className="signup-form__footer">
					<p className="signup-form__terms-of-service-link">
						By creating an account you agree to our { renderTosLink() }.
					</p>

					<Button
						type="submit"
						className="signup-form__submit"
						disabled={ status === UsePasswordlessSignUpStatus.Authenticating }
						isPrimary
					>
						Sign up
					</Button>
				</div>
			</form>
			{ status && <p>Status: { JSON.stringify( status, null, 2 ) }</p> }
			{ error && <p>Error: { JSON.stringify( String( error ), null, 2 ) }</p> }
		</Modal>
	);
};

const WrappedSignupForm = () => {
	const client = new Client( {
		clientID: '39911',
		clientSecret: 'cOaYKdrkgXz8xY7aysv4fU6wL6sK5J8a6ojReEIAPwggsznj4Cb6mW0nffTxtYT8',
	} );
	return (
		<Provider client={ client }>
			<SignupForm />
		</Provider>
	);
};

export default WrappedSignupForm;
