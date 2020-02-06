/**
 * External dependencies
 */
import React, { useState } from 'react';
import { Button, ExternalLink, TextControl, Modal } from '@wordpress/components';
import { useDispatch, useSelect } from '@wordpress/data';
import { __experimentalCreateInterpolateElement } from '@wordpress/element';
import { __ as NO__, _x as NO_x } from '@wordpress/i18n';

/**
 * Internal dependencies
 */
import { USER_STORE } from '../../stores/user';
import { STORE_KEY as ONBOARD_STORE } from '../../stores/onboard';
import './style.scss';

// TODO: deploy this change to @types/wordpress__element
declare module '@wordpress/element' {
	// eslint-disable-next-line no-shadow
	export function __experimentalCreateInterpolateElement(
		interpolatedString: string,
		conversionMap: Record< string, ReactElement >
	): ReactNode;
}

const SignupForm = () => {
	const [ emailVal, setEmailVal ] = useState( '' );
	const { createAccount } = useDispatch( USER_STORE );
	const { setShouldCreate } = useDispatch( ONBOARD_STORE );
	const isFetchingNewUser = useSelect( select => select( USER_STORE ).isFetchingNewUser() );
	const newUser = useSelect( select => select( USER_STORE ).getNewUser() );
	const newUserError = useSelect( select => select( USER_STORE ).getNewUserError() );
	const { shouldCreate } = useSelect( select => select( ONBOARD_STORE ) ).getState();

	const handleSignUp = ( event: React.FormEvent< HTMLFormElement > ) => {
		event.preventDefault();

		createAccount( { email: emailVal, is_passwordless: true, signup_flow_name: 'gutenboarding' } );
	};

	if ( newUser && shouldCreate ) {
		//TODO: replace with correct action dispatching when https://github.com/Automattic/wp-calypso/pull/39050 is merged
		window.location.reload( false );
	}
	if ( newUserError && shouldCreate ) {
		setShouldCreate( false );
	}

	return (
		<Modal
			className="signup-form"
			isDismissible={ false }
			title={ NO__( 'Sign up to save your changes' ) }
			onRequestClose={ () => undefined }
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
