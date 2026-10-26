import { accountRecoveryQuery, cancelPendingEmailChangeMutation } from '@automattic/api-queries';
import {
	getEmailAddressError,
	getEmailDomain,
	isValidEmailAddress,
} from '@automattic/onboarding/src/utils/email-validation';
import { useMutation, useQuery } from '@tanstack/react-query';
import {
	__experimentalInputControl as InputControl,
	__experimentalVStack as VStack,
	Button,
} from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { Icon, info, check } from '@wordpress/icons';
import { createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../app/auth';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import Notice from '../../components/notice';
import RouterLinkButton from '../../components/router-link-button';
import { recoveryEmailMatchesAccountEmail } from '../security-account-recovery/utils';
import { isCustomDomainEmail } from './email-utils';
import { useIsEmailWritePending } from './use-email-write-pending';
import type { UserSettings } from '@automattic/api-core';
import type { DataFormControlProps, Field, Form } from '@wordpress/dataviews';
import type { ReactNode } from 'react';
import './style.scss';

interface EmailSectionProps {
	value: string;
	onChange: ( value: string ) => void;
	disabled?: boolean;
	userSettings: UserSettings;
	isEmailVerified: boolean;
	onValidationChange?: ( isValid: boolean ) => void;
	serverError?: string | null;
}

type EmailFormData = { user_email: string };

const EmailFieldContext = createContext< {
	help: ReactNode;
	className: string;
	disabled: boolean;
} >( { help: null, className: '', disabled: false } );

// Defined at module level so DataForm gets a stable component and the input keeps focus while typing.
function EmailEdit( { data, field, onChange, validity }: DataFormControlProps< EmailFormData > ) {
	const context = useContext( EmailFieldContext );
	const { disabled } = context;
	const customError = validity?.custom?.type === 'invalid' ? validity.custom.message : null;
	const help = customError ? (
		<>
			<Icon icon={ info } size={ 16 } />
			{ customError }
		</>
	) : (
		context.help
	);
	const className = customError ? 'has-error' : context.className;
	return (
		<InputControl
			__next40pxDefaultSize
			id="email-input"
			type="text"
			label={ field.label }
			value={ data.user_email }
			onChange={ ( newValue?: string ) => onChange( { user_email: newValue ?? '' } ) }
			autoComplete="email"
			disabled={ disabled }
			className={ className }
			help={ help }
			aria-describedby={ help ? 'email-help' : undefined }
		/>
	);
}

const emailFields: Field< EmailFormData >[] = [
	{
		id: 'user_email',
		label: __( 'Email address' ),
		type: 'text',
		Edit: EmailEdit,
	},
];

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
	serverError,
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

	const getValidationClass = () => {
		if ( isEmailPending ) {
			return '';
		}
		if ( showBouncingEmailError ) {
			return 'has-error';
		}
		if ( emailValidationState === 'valid' ) {
			return 'has-success';
		}
		if ( emailValidationState === 'invalid' || emailValidationState === 'unknown_tld' ) {
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

		if ( showBouncingEmailError ) {
			return (
				<>
					<Icon icon={ info } size={ 16 } />
					{ __( 'Messages we send to this address are bouncing back. Please update your email.' ) }
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

			if ( emailValidationState === 'unknown_tld' ) {
				return (
					<>
						<Icon icon={ info } size={ 16 } />
						{ sprintf(
							/* translators: %s: the domain part of the email address the user typed */
							__( '“%s” doesn’t look like a real domain. Check the address for typos.' ),
							getEmailDomain( value )
						) }
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

		// The saved email address has never been verified (and no change is pending).
		if ( ! isEmailVerified ) {
			return __( 'Your email has not been verified yet.' );
		}

		return null;
	}, [
		isEmailPending,
		isEmailVerified,
		showBouncingEmailError,
		value,
		currentEmail,
		emailValidationState,
		handleCancelPendingEmail,
		isEmailWritePending,
	] );

	const validity = useMemo(
		() =>
			serverError
				? ( { user_email: { custom: { type: 'invalid', message: serverError } } } as const )
				: undefined,
		[ serverError ]
	);
	const formData = useMemo( () => ( { user_email: value } ), [ value ] );
	const help = getHelpText();
	const className = getValidationClass();
	const fieldContext = useMemo(
		() => ( { help, className, disabled: disabled || !! isEmailPending } ),
		[ help, className, disabled, isEmailPending ]
	);

	return (
		<VStack spacing={ 4 }>
			<EmailFieldContext.Provider value={ fieldContext }>
				<DataForm< EmailFormData >
					data={ formData }
					fields={ emailFields }
					form={ emailForm }
					validity={ validity }
					onChange={ ( edits ) => onChange( edits.user_email ?? '' ) }
				/>
			</EmailFieldContext.Provider>
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
