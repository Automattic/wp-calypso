import { Button, Card, CardBody, Notice, Spinner } from '@wordpress/components';
import { __ } from '@wordpress/i18n';
import { useEffect, useState } from 'react';
import twoStepAuthorization from 'calypso/lib/two-step-authorization';
import { useAuth } from '../auth';

interface SecurityKeyFormProps {
	/**
	 * The two-step authorization module. Allows for testing by injecting a mock.
	 */
	twoStepAuthorization?: typeof twoStepAuthorization;

	/**
	 * Callback for when the authentication completes (success or failure).
	 */
	onComplete?: ( error: unknown, data: unknown ) => void;
}

/**
 * Component for handling security key authentication
 */
export default function SecurityKeyForm( {
	twoStepAuthorization: twoStepAuth = twoStepAuthorization,
	onComplete,
}: SecurityKeyFormProps ) {
	const [ isAuthenticating, setIsAuthenticating ] = useState( false );
	const [ showError, setShowError ] = useState( false );

	const handleAuthComplete = ( error: unknown, data: unknown ) => {
		if ( onComplete ) {
			onComplete( error, data );
		}
		// Otherwise we let the twoStepAuthorization module handle the result
		// through its event system.
	};

	const { user } = useAuth();

	const initiateSecurityKeyAuthentication = ( retryRequest = true ) => {
		setIsAuthenticating( true );
		setShowError( false );

		// Get the current user ID
		const currentUserId = user.ID;
		twoStepAuth
			.loginUserWithSecurityKey( { user_id: currentUserId } )
			.then( ( response ) => handleAuthComplete( null, response ) )
			.catch( ( error ) => {
				const errors = error?.data?.errors ?? [];
				if ( errors.some( ( e ) => e.code === 'invalid_two_step_nonce' ) ) {
					twoStepAuth.fetch( () => {
						if ( retryRequest ) {
							initiateSecurityKeyAuthentication( false );
						} else {
							// We only retry once, so let's show the original error.
							setIsAuthenticating( false );
							setShowError( true );
							handleAuthComplete( error, null );
						}
					} );
					return;
				}
				setIsAuthenticating( false );
				setShowError( true );
				handleAuthComplete( error, null );
			} );
	};

	useEffect( () => {
		initiateSecurityKeyAuthentication();
	}, [] );

	const handleFormSubmit = ( event: React.FormEvent ) => {
		event.preventDefault();
		initiateSecurityKeyAuthentication();
	};

	return (
		<form onSubmit={ handleFormSubmit }>
			<Card>
				<CardBody>
					{ ! isAuthenticating ? (
						<div>
							<p>
								<strong>{ __( 'Use your security key to finish logging in.' ) }</strong>
							</p>
							<p>
								{ __(
									'Insert your hardware security key, or follow the instructions in your browser or phone to log in.'
								) }
							</p>
						</div>
					) : (
						<div style={ { textAlign: 'center' } }>
							<Spinner />
							<p style={ { fontWeight: 600, marginTop: '8px' } }>
								{ __( 'Waiting for security key' ) }
							</p>
							<p>
								{ __(
									'Connect and touch your security key to log in, or follow the directions in your browser or pop-up.'
								) }
							</p>
						</div>
					) }

					{ showError && (
						<Notice status="error" isDismissible={ false }>
							{ __(
								'An error occurred, please try again or use an alternate authentication method.'
							) }
						</Notice>
					) }

					<div style={ { marginTop: '16px' } }>
						<Button
							type="submit"
							variant="primary"
							disabled={ isAuthenticating }
							style={ { width: '100%' } }
						>
							{ __( 'Continue with security key' ) }
						</Button>
					</div>
				</CardBody>
			</Card>
		</form>
	);
}
