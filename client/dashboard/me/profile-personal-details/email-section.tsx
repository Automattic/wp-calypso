import { accountRecoveryQuery, cancelPendingEmailChangeMutation } from '@automattic/api-queries';
import {
	getEmailAddressError,
	getEmailDomain,
	isValidEmailAddress,
} from '@automattic/onboarding/src/utils/email-validation';
import { useMutation, useQuery } from '@tanstack/react-query';
import { __experimentalVStack as VStack, Button, privateApis } from '@wordpress/components';
import { DataForm } from '@wordpress/dataviews';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import { __dangerousOptInToUnstableAPIsOnlyForCoreModules } from '@wordpress/private-apis';
import { createContext, useMemo, useEffect, useCallback, useContext, useRef } from 'react';
import { useAuth } from '../../app/auth';
import { withSnackbar } from '../../app/snackbars/with-snackbar';
import Notice from '../../components/notice';
import RouterLinkButton from '../../components/router-link-button';
import { recoveryEmailMatchesAccountEmail } from '../security-account-recovery/utils';
import { isCustomDomainEmail } from './email-utils';
import { useIsEmailWritePending } from './use-email-write-pending';
import type { UserSettings } from '@automattic/api-core';
import type { DataFormControlProps, Field, Form, FormValidity } from '@wordpress/dataviews';

interface EmailSectionProps {
	value: string;
	onChange: ( value: string ) => void;
	disabled?: boolean;
	userSettings: UserSettings;
	isEmailVerified: boolean;
	onValidationChange?: ( isValid: boolean ) => void;
	/**
	 * An error from saving the email address, shown on the field until the address is changed.
	 */
	serverError?: string;
}

type EmailFormData = { user_email: string };

const { unlock } = __dangerousOptInToUnstableAPIsOnlyForCoreModules(
	'I acknowledge private features are not for use in themes or plugins and doing so will break in the next version of WordPress.',
	'@wordpress/components'
);
const { ValidatedInputControl } = unlock( privateApis );

const HasEmailSaveErrorContext = createContext( false );

/**
 * A validity message only shows once the field has been blurred. An error that appears without the
 * user typing, like a bouncing email, needs to show straight away, so mark the field blurred then.
 * A synthetic `focusout` does that without moving focus, unlike an `invalid` event. A save error
 * moves focus to the field, since disabling the input during the save drops focus in browsers.
 */
function EmailEdit( { data, field, onChange, validity }: DataFormControlProps< EmailFormData > ) {
	const hasSaveError = useContext( HasEmailSaveErrorContext );
	const inputRef = useRef< HTMLInputElement >( null );
	const isInvalid = validity?.custom?.type === 'invalid';

	useEffect( () => {
		const input = inputRef.current;
		if ( ! isInvalid || ! input ) {
			return;
		}
		if ( hasSaveError ) {
			input.focus();
		} else if ( input.ownerDocument.activeElement === input ) {
			return;
		}
		input.dispatchEvent( new FocusEvent( 'focusout', { bubbles: true } ) );
	}, [ isInvalid, hasSaveError ] );

	return (
		<ValidatedInputControl
			__next40pxDefaultSize
			id="email-input"
			type="text"
			autoComplete="email"
			ref={ inputRef }
			customValidity={ validity?.custom }
			label={ field.label }
			help={ field.description }
			value={ field.getValue( { item: data } ) ?? '' }
			onChange={ ( value?: string ) =>
				onChange( field.setValue( { item: data, value: value ?? '' } ) )
			}
			disabled={ field.isDisabled( { item: data, field } ) }
		/>
	);
}

const emailForm: Form = {
	layout: { type: 'regular' },
	fields: [ 'user_email' ],
};

type EmailValidationState = 'valid' | 'invalid' | 'unknown_tld' | null;

function getEmailValidationState( email: string, currentEmail: string ): EmailValidationState {
	if ( ! email || email === currentEmail ) {
		return null;
	}

	try {
		const emailError = getEmailAddressError( email );
		if ( emailError === 'unknown_tld' ) {
			return 'unknown_tld';
		}
		return emailError ? 'invalid' : 'valid';
	} catch ( error ) {
		return 'invalid';
	}
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

	const handleCancelPendingEmail = useCallback( () => {
		cancelPendingEmail();
	}, [ cancelPendingEmail ] );

	const emailValidationState = getEmailValidationState( value, currentEmail );
	const isEmailValid =
		! serverError && ( emailValidationState === 'valid' || emailValidationState === null );

	useEffect( () => {
		onValidationChange?.( isEmailValid );
	}, [ isEmailValid, onValidationChange ] );

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

	const validity = useMemo( (): FormValidity => {
		if ( isEmailPending ) {
			return undefined;
		}

		if ( serverError ) {
			return { user_email: { custom: { type: 'invalid', message: serverError } } };
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
	}, [
		isEmailPending,
		serverError,
		showBouncingEmailError,
		value,
		currentEmail,
		emailValidationState,
	] );

	const hasEmailError = validity?.user_email?.custom?.type === 'invalid';

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
		if ( ! isEmailVerified && ! hasEmailError ) {
			return __( 'Your email has not been verified yet.' );
		}

		if ( validity?.user_email?.custom ) {
			return undefined;
		}

		return __( 'Sign-in and account emails. Not shown publicly.' );
	}, [
		isEmailPending,
		isEmailVerified,
		hasEmailError,
		validity,
		handleCancelPendingEmail,
		isEmailWritePending,
	] );

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
			<HasEmailSaveErrorContext.Provider value={ !! serverError }>
				<DataForm< EmailFormData >
					data={ formData }
					fields={ fields }
					form={ emailForm }
					validity={ validity }
					onChange={ ( edits ) => onChange( edits.user_email ?? '' ) }
				/>
			</HasEmailSaveErrorContext.Provider>
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
