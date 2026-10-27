import { accountRecoveryQuery, cancelPendingEmailChangeMutation } from '@automattic/api-queries';
import {
	getEmailAddressError,
	getEmailDomain,
	isValidEmailAddress,
} from '@automattic/onboarding/src/utils/email-validation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button } from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { useMemo, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../app/auth';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import Notice from '../../components/notice';
import RouterLinkButton from '../../components/router-link-button';
import { recoveryEmailMatchesAccountEmail } from '../security-account-recovery/utils';
import { isCustomDomainEmail } from './email-utils';
import { useIsEmailWritePending } from './use-email-write-pending';
import { createValidatedTextEdit, ShowValidityImmediatelyContext } from './validated-text-edit';
import type { UserSettings } from '@automattic/api-core';
import type { Field, Form, FormValidity } from '@wordpress/dataviews';

interface EmailSectionProps {
	value: string;
	onChange: ( value: string ) => void;
	disabled?: boolean;
	userSettings: UserSettings;
	isEmailVerified: boolean;
	onValidationChange?: ( isValid: boolean ) => void;
}

type EmailFormData = { user_email: string };

const EmailEdit = createValidatedTextEdit< EmailFormData >( {
	id: 'email-input',
	type: 'text',
	autoComplete: 'email',
} );

const emailForm: Form = {
	layout: { type: 'regular' },
	fields: [ 'user_email' ],
};

type EmailValidationState = 'valid' | 'invalid' | 'unknown_tld' | null;

function useEmailValidation( onValidationChange?: ( isValid: boolean ) => void ) {
	const [ emailValidationState, setEmailValidationStateValue ] =
		useState< EmailValidationState >( null );

	const setEmailValidationState = useCallback(
		( state: EmailValidationState ) => {
			setEmailValidationStateValue( state );
			onValidationChange?.( state === 'valid' || state === null );
		},
		[ onValidationChange ]
	);

	return [ emailValidationState, setEmailValidationState ] as const;
}

export default function EmailSection( {
	value,
	onChange,
	disabled = false,
	userSettings,
	isEmailVerified,
	onValidationChange,
}: EmailSectionProps ) {
	const mutation = cancelPendingEmailChangeMutation();
	const isEmailWritePending = useIsEmailWritePending();

	const { mutate: cancelPendingEmail } = useMutation( {
		...withSnackbar( mutation, {
			success: __( 'Pending email change canceled.' ),
			error: __( 'Failed to cancel pending email change.' ),
		} ),
		onSuccess: ( data, variables, context ) => {
			// Call the original onSuccess from the mutation if it exists
			if ( mutation.onSuccess ) {
				mutation.onSuccess( data, variables, context );
			}
			// Use the fresh data from the mutation response
			onChange( data.user_email || '' );
		},
	} );

	const isEmailPending = userSettings.user_email_change_pending;
	const pendingEmail = userSettings.new_user_email;
	const currentEmail = isEmailPending && pendingEmail ? pendingEmail : userSettings.user_email;

	const [ emailValidationState, setEmailValidationState ] =
		useEmailValidation( onValidationChange );

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
				const emailError = getEmailAddressError( email );
				if ( emailError === 'unknown_tld' ) {
					setEmailValidationState( 'unknown_tld' );
				} else if ( emailError ) {
					setEmailValidationState( 'invalid' );
				} else {
					setEmailValidationState( 'valid' );
				}
			} catch ( error ) {
				setEmailValidationState( 'invalid' );
			}
		},
		[ currentEmail, setEmailValidationState ]
	);

	useEffect( () => {
		validateEmail( value );
	}, [ value, validateEmail ] );

	const { user } = useAuth();
	const { data: accountRecovery } = useQuery( accountRecoveryQuery() );
	const isAccountRecoveryReady = accountRecovery !== undefined;
	const hasUsableRecoveryEmail =
		!! accountRecovery?.email &&
		! recoveryEmailMatchesAccountEmail( accountRecovery.email, userSettings.user_email );
	const hasRecoveryMethod = hasUsableRecoveryEmail || !! accountRecovery?.phone;

	const showBouncingEmailError =
		! isEmailPending && !! user.email_bouncing && value === userSettings.user_email;

	const showCustomDomainWarning =
		! isEmailPending &&
		!! value &&
		isValidEmailAddress( value ) &&
		isCustomDomainEmail( value ) &&
		isAccountRecoveryReady &&
		! hasRecoveryMethod;

	const description = useMemo( () => {
		if ( isEmailPending ) {
			return (
				<>
					{ createInterpolateElement( __( '<em>Your email has not been verified yet.</em>' ), {
						em: <em />,
					} ) }{ ' ' }
					<Button
						variant="link"
						onClick={ handleCancelPendingEmail }
						disabled={ isEmailWritePending }
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

		// The saved email address has never been verified (and no change is pending).
		if ( ! isEmailVerified ) {
			return __( 'Your email has not been verified yet.' );
		}

		return undefined;
	}, [ isEmailPending, isEmailVerified, handleCancelPendingEmail, isEmailWritePending ] );

	const validity = useMemo( (): FormValidity => {
		if ( isEmailPending ) {
			return undefined;
		}

		if ( showBouncingEmailError ) {
			return {
				user_email: {
					custom: {
						type: 'invalid',
						message: __(
							'Messages we send to this address are bouncing back. Please update your email.'
						),
					},
				},
			};
		}

		if ( ! value || value === currentEmail ) {
			return undefined;
		}

		if ( emailValidationState === 'valid' ) {
			return {
				user_email: {
					custom: { type: 'valid', message: __( 'Email address looks good!' ) },
				},
			};
		}

		if ( emailValidationState === 'unknown_tld' ) {
			return {
				user_email: {
					custom: {
						type: 'invalid',
						message: sprintf(
							/* translators: %s: the domain part of the email address the user typed */
							__( '“%s” doesn’t look like a real domain. Check the address for typos.' ),
							getEmailDomain( value )
						),
					},
				},
			};
		}

		if ( emailValidationState === 'invalid' ) {
			return {
				user_email: {
					custom: { type: 'invalid', message: __( 'Please enter a valid email address.' ) },
				},
			};
		}

		return undefined;
	}, [ isEmailPending, showBouncingEmailError, value, currentEmail, emailValidationState ] );

	const fields = useMemo(
		(): Field< EmailFormData >[] => [
			{
				id: 'user_email',
				label: __( 'Email address' ),
				type: 'text',
				description,
				isDisabled: disabled || !! isEmailPending,
				Edit: EmailEdit,
			},
		],
		[ description, disabled, isEmailPending ]
	);

	const formData = useMemo( () => ( { user_email: value } ), [ value ] );

	return (
		<VStack spacing={ 4 }>
			<ShowValidityImmediatelyContext.Provider value={ showBouncingEmailError }>
				<DataForm< EmailFormData >
					data={ formData }
					fields={ fields }
					form={ emailForm }
					validity={ validity }
					onChange={ ( edits ) => onChange( edits.user_email ?? '' ) }
				/>
			</ShowValidityImmediatelyContext.Provider>
			{ showCustomDomainWarning && (
				<Notice
					variant="warning"
					title={ __( 'Protect access to your account' ) }
					actions={
						<RouterLinkButton variant="secondary" to="/me/security/account-recovery">
							{ __( 'Set up account recovery' ) }
						</RouterLinkButton>
					}
				>
					{ __(
						'This email uses a custom domain. If your domain expires, you’d lose access to account recovery. Add a recovery email or phone number to keep access to your account.'
					) }
				</Notice>
			) }
		</VStack>
	);
}
