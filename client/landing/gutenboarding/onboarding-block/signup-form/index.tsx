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
import FormLabel from 'components/forms/form-label';
import { __ as NO__ } from '@wordpress/i18n';
import config from '../../../../config';
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
					disabled={ status === UsePasswordlessSignUpStatus.Authenticating }
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
						disabled={ status === UsePasswordlessSignUpStatus.Authenticating }
						isPrimary
					>
						{ NO__( 'Create your account' ) }
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
		clientID: config( 'wpcom_signup_id' ),
		clientSecret: config( 'wpcom_signup_key' ),
	} );
	return (
		<Provider client={ client }>
			<SignupForm />
		</Provider>
	);
};

export default WrappedSignupForm;
