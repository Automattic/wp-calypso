import { cancelPendingEmailChangeMutation } from '@automattic/api-queries';
import { useMutation } from '@tanstack/react-query';
import { __experimentalInputControl as InputControl, Button } from '@wordpress/components';
import { createInterpolateElement } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import { Icon, info, check } from '@wordpress/icons';
import emailValidator from 'email-validator';
import { useState, useEffect, useCallback } from 'react';
import type { UserSettings } from '@automattic/api-core';
import './style.scss';

interface EmailSectionProps {
	value: string;
	onChange: ( value: string ) => void;
	disabled?: boolean;
	userData: UserSettings;
}

export default function EmailSection( {
	value,
	onChange,
	disabled = false,
	userData,
}: EmailSectionProps ) {
	const mutation = cancelPendingEmailChangeMutation();

	const { mutate: cancelPendingEmail, isPending: isCancelPending } = useMutation( {
		...mutation,
		onSuccess: ( data, variables, context ) => {
			// Call the original onSuccess from the mutation if it exists
			if ( mutation.onSuccess ) {
				mutation.onSuccess( data, variables, context );
			}
			// Use the fresh data from the mutation response
			onChange( data.user_email || '' );
		},
		meta: {
			snackbar: {
				success: __( 'Pending email change canceled.' ),
				error: __( 'Failed to cancel pending email change.' ),
			},
		},
	} );

	const isEmailPending = userData.user_email_change_pending;
	const pendingEmail = userData.new_user_email;
	const currentEmail = isEmailPending && pendingEmail ? pendingEmail : userData.user_email;

	const [ emailValidationState, setEmailValidationState ] = useState< 'valid' | 'invalid' | null >(
		null
	);

	const handleCancelPendingEmail = useCallback( () => {
		cancelPendingEmail();
	}, [ cancelPendingEmail ] );

	const validateEmail = useCallback(
		( email: string ) => {
			if ( ! email || email === currentEmail ) {
				setEmailValidationState( null );
				return;
			}

			try {
				if ( ! emailValidator.validate( email ) ) {
					setEmailValidationState( 'invalid' );
				} else {
					setEmailValidationState( 'valid' );
				}
			} catch ( error ) {
				setEmailValidationState( 'invalid' );
			}
		},
		[ currentEmail ]
	);

	useEffect( () => {
		validateEmail( value );
	}, [ value, validateEmail ] );

	const getValidationClass = () => {
		if ( isEmailPending ) {
			return '';
		}
		if ( emailValidationState === 'valid' ) {
			return 'has-success';
		}
		if ( emailValidationState === 'invalid' ) {
			return 'has-error';
		}
		return '';
	};

	// Inline helper messages
	const getHelpText = useCallback( () => {
		// Pending state static message
		if ( isEmailPending ) {
			return (
				<>
					{ createInterpolateElement( __( '<em>Your email has not been verified yet.</em>' ), {
						em: <em />,
					} ) }{ ' ' }
					<Button
						variant="link"
						onClick={ handleCancelPendingEmail }
						disabled={ isCancelPending }
						style={ {
							padding: 0,
							height: 'auto',
							textDecoration: 'underline',
							fontSize: 'inherit',
						} }
					>
						{ createInterpolateElement( __( '<em>Cancel the pending email change.</em>' ), {
							em: <em />,
						} ) }
					</Button>
				</>
			);
		}

		// Input validation messages
		if ( value && value !== currentEmail ) {
			if ( emailValidationState === 'valid' ) {
				return (
					<>
						<Icon icon={ check } size={ 16 } />
						{ __( 'Email address looks good!' ) }
					</>
				);
			}

			if ( emailValidationState === 'invalid' ) {
				return (
					<>
						<Icon icon={ info } size={ 16 } />
						{ __( 'Please enter a valid email address.' ) }
					</>
				);
			}
		}

		return null;
	}, [
		isEmailPending,
		value,
		currentEmail,
		emailValidationState,
		handleCancelPendingEmail,
		isCancelPending,
	] );

	return (
		<InputControl
			__next40pxDefaultSize
			id="email-input"
			type="text"
			label={ __( 'Email address' ) }
			value={ value }
			onChange={ ( newValue ) => onChange( newValue ?? '' ) }
			autoComplete="email"
			disabled={ disabled || isEmailPending }
			className={ getValidationClass() }
			help={ getHelpText() }
			aria-describedby={ getHelpText() ? 'email-help' : undefined }
		/>
	);
}
