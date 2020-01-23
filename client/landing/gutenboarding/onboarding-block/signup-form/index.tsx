/**
 * External dependencies
 */
import { noop } from 'lodash';
import React, { useState } from 'react';
import { Button, ExternalLink, TextControl, Modal } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __experimentalCreateInterpolateElement } from '@wordpress/element';
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
	const newUser = useSelect( select => select( USER_STORE ).getNewUser() );
	const newUserError = useSelect( select => select( USER_STORE ).getNewUserError() );

	const handleSignUp = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();

		createAccount( { email: emailVal, is_passwordless: true, signup_flow_name: 'gutenboarding' } );
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
					type="email"
					onChange={ setEmailVal }
					placeholder={ NO_x(
						'E.g., yourname@email.com',
						"An example of a person's email, use something appropriate for the locale"
					) }
				/>
				<div className="signup-form__footer">
					<p className="signup-form__terms-of-service-link">{ renderTos() }</p>

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
			{ newUser && <pre>New user: { JSON.stringify( newUser, null, 2 ) }</pre> }
		</Modal>
	);
};

function renderTos() {
	return __experimentalCreateInterpolateElement(
		NO__( 'By creating an account you agree to our <link_to_tos>Terms of Service</link_to_tos>.' ),
		{
			link_to_tos: <ExternalLink href="https://wordpress.com/tos/" />,
		}
	);
}

export default SignupForm;
