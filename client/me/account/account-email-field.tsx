import { FormInputValidation, FormLabel } from '@automattic/components';
import { Button } from '@wordpress/components';
import { removeQueryArgs } from '@wordpress/url';
import emailValidator from 'email-validator';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useRef, useState } from 'react';
import QueryAccountRecoverySettings from 'calypso/components/data/query-account-recovery-settings';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { useDispatch, useSelector } from 'calypso/state';
import {
	getAccountRecoveryEmail,
	getAccountRecoveryPhone,
	isAccountRecoverySettingsReady,
} from 'calypso/state/account-recovery/settings/selectors';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import isPendingEmailChange from 'calypso/state/selectors/is-pending-email-change';
import {
	cancelPendingEmailChange,
	removeUnsavedUserSetting,
	setUserSetting,
} from 'calypso/state/user-settings/actions';
import type { UserSettingsType } from 'calypso/state/selectors/get-user-settings';
import type { ChangeEvent } from 'react';

import './account-email-field.scss';

export type AccountEmailFieldProps = {
	emailInputId?: string;
	emailInputName?: string;
	emailValidationHandler?: ( isEmailValid: boolean ) => void;
	isEmailControlDisabled?: boolean;
	onEmailChange?: ( isEmailModified: boolean ) => void;
	onFocus?: () => void;
	unsavedUserSettings?: UserSettingsType;
	userSettings?: UserSettingsType;
};

const EMAIL_VALIDATION_REASON_EMPTY = 'empty';
const EMAIL_VALIDATION_REASON_INVALID = 'invalid';
const EMAIL_VALIDATION_REASON_IS_VALID = null;

type AccountEmailValidationReason =
	| typeof EMAIL_VALIDATION_REASON_EMPTY
	| typeof EMAIL_VALIDATION_REASON_INVALID
	| typeof EMAIL_VALIDATION_REASON_IS_VALID;

const getUserSetting = ( {
	settingName,
	unsavedUserSettings,
	userSettings,
}: {
	settingName: string;
	unsavedUserSettings: UserSettingsType;
	userSettings: UserSettingsType;
} ) => {
	return unsavedUserSettings?.[ settingName ] ?? userSettings?.[ settingName ] ?? '';
};

const AccountEmailValidationNotice = ( {
	emailInvalidReason,
	unsavedUserSettings,
	userSettings,
}: {
	emailInvalidReason: AccountEmailValidationReason;
	unsavedUserSettings: UserSettingsType;
	userSettings: UserSettingsType;
} ) => {
	const translate = useTranslate();

	if ( unsavedUserSettings?.user_email === null || unsavedUserSettings?.user_email === undefined ) {
		return null;
	}

	if ( emailInvalidReason === EMAIL_VALIDATION_REASON_IS_VALID ) {
		return null;
	}

	let noticeText;

	if ( emailInvalidReason === EMAIL_VALIDATION_REASON_EMPTY ) {
		noticeText = translate( 'Email address can not be empty.' );
	} else if ( emailInvalidReason === EMAIL_VALIDATION_REASON_INVALID ) {
		noticeText = translate( '%(email)s is not a valid email address.', {
			args: {
				email: getUserSetting( {
					settingName: 'user_email',
					unsavedUserSettings,
					userSettings,
				} ) as string,
			},
		} );
	}

	return <FormInputValidation isError text={ noticeText } />;
};

/**
 * Well-known free email providers whose addresses are not at risk of expiry.
 * Anything not on this list is treated as a custom domain that could expire.
 */
const FREE_EMAIL_PROVIDERS = new Set( [
	'gmail.com',
	'googlemail.com',
	'yahoo.com',
	'yahoo.co.uk',
	'yahoo.fr',
	'yahoo.de',
	'yahoo.es',
	'yahoo.it',
	'yahoo.ca',
	'yahoo.com.au',
	'hotmail.com',
	'hotmail.co.uk',
	'hotmail.fr',
	'hotmail.de',
	'hotmail.es',
	'hotmail.it',
	'outlook.com',
	'outlook.co.uk',
	'outlook.fr',
	'outlook.de',
	'live.com',
	'live.co.uk',
	'live.fr',
	'live.de',
	'msn.com',
	'icloud.com',
	'me.com',
	'mac.com',
	'aol.com',
	'protonmail.com',
	'proton.me',
	'tutanota.com',
	'tutamail.com',
	'zoho.com',
	'fastmail.com',
	'fastmail.fm',
	'yandex.com',
	'yandex.ru',
	'mail.ru',
	'gmx.com',
	'gmx.de',
	'gmx.net',
	'web.de',
	'wp.pl',
] );

/**
 * Extracts the domain part of an email address (lowercased). Returns null
 * if the value does not look like an email with a domain.
 */
const getEmailDomain = ( email: string ): string | null => {
	const atIndex = email.lastIndexOf( '@' );
	if ( atIndex < 0 || atIndex === email.length - 1 ) {
		return null;
	}
	return email.slice( atIndex + 1 ).toLowerCase();
};

/**
 * Returns true if the email domain is a custom domain (i.e. not a well-known
 * free email provider), meaning it is subject to expiry risk.
 */
const isCustomDomainEmail = ( email: string ): boolean => {
	const domain = getEmailDomain( email );
	return domain !== null && ! FREE_EMAIL_PROVIDERS.has( domain );
};

const AccountEmailCustomDomainNotice = ( { email }: { email: string } ) => {
	const translate = useTranslate();
	const isSettingsReady = useSelector( isAccountRecoverySettingsReady );
	const recoveryEmail = useSelector( getAccountRecoveryEmail );
	const recoveryPhone = useSelector( getAccountRecoveryPhone );

	if ( ! isCustomDomainEmail( email ) ) {
		return null;
	}

	const hasRecoveryMethod = !! recoveryEmail || !! recoveryPhone;

	return (
		<>
			<QueryAccountRecoverySettings />
			{ isSettingsReady && ! hasRecoveryMethod && (
				<FormInputValidation
					isError={ false }
					isWarning
					text={ translate(
						"This email uses a custom domain. If your domain expires, you'd lose access to account recovery. {{a}}Set up a recovery email or phone number{{/a}} to keep access to your account.",
						{
							components: {
								a: <a href="/me/security/account-recovery" />,
							},
						}
					) }
				/>
			) }
		</>
	);
};

const EmailFieldExplanationText = ( {
	unlockRef,
}: {
	unlockRef: React.RefObject< HTMLButtonElement | null >;
} ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();
	const isEmailVerified = useSelector( isCurrentUserEmailVerified );
	const isEmailChangePending = useSelector( isPendingEmailChange );

	const cancelWrapper = (
		<Button
			className="account-email-field__enable-input"
			variant="link"
			onClick={ ( ev: React.MouseEvent< HTMLButtonElement > ) => {
				ev.preventDefault();
				dispatch( cancelPendingEmailChange() );
			} }
			ref={ unlockRef }
		/>
	);

	if ( isEmailChangePending ) {
		// Show unverified message and cancel pending change option.
		return translate(
			'Your email has not been verified yet. {{cancelWrapper}}Cancel the pending email change{{/cancelWrapper}}.',
			{
				components: {
					cancelWrapper,
				},
			}
		);
	}

	if ( ! isEmailVerified ) {
		// Show unverified message.
		return translate( 'Your email has not been verified yet.' );
	}

	// Standard message.
	return translate( 'Not publicly displayed, except to owners of sites you subscribe to.' );
};

export const emailFormEventEmitter = new EventTarget();

const AccountEmailField = ( {
	emailInputId = 'user_email',
	emailInputName = 'user_email',
	emailValidationHandler,
	isEmailControlDisabled = false,
	onEmailChange,
	onFocus,
	unsavedUserSettings = {},
	userSettings = {},
}: AccountEmailFieldProps ) => {
	const inputRef = useRef< HTMLInputElement >( null );
	const unlockRef = useRef< HTMLButtonElement >( null );
	const dispatch = useDispatch();
	const translate = useTranslate();
	const isEmailChangePending = useSelector( isPendingEmailChange );
	const currentQuery = useSelector( getCurrentQueryArguments );
	const [ emailInvalidReason, setEmailInvalidReason ] = useState< AccountEmailValidationReason >(
		EMAIL_VALIDATION_REASON_IS_VALID
	);

	useEffect( () => {
		// Ensure that we remove any unsaved changes to the email address when we unmount
		return (): void => {
			dispatch( removeUnsavedUserSetting( 'user_email' ) );
		};
	}, [ dispatch ] );

	const emailAddress = getUserSetting( {
		settingName: isEmailChangePending ? 'new_user_email' : 'user_email',
		unsavedUserSettings,
		userSettings,
	} );

	const onEmailAddressChange = ( event: ChangeEvent< HTMLInputElement > ): void => {
		const { value } = event.target;

		let emailValidationReason: AccountEmailValidationReason = EMAIL_VALIDATION_REASON_IS_VALID;

		if ( value === '' ) {
			emailValidationReason = EMAIL_VALIDATION_REASON_EMPTY;
		} else if ( ! emailValidator.validate( value ) ) {
			emailValidationReason = EMAIL_VALIDATION_REASON_INVALID;
		}

		setEmailInvalidReason( emailValidationReason );
		emailValidationHandler?.( emailValidationReason === EMAIL_VALIDATION_REASON_IS_VALID );

		onEmailChange?.( value !== userSettings.user_email );

		dispatch( setUserSetting( 'user_email', value ) );
	};

	const scrollAndFocus = useCallback( () => {
		if ( isEmailChangePending ) {
			unlockRef.current?.focus();
		} else {
			inputRef.current?.focus();
		}
		// We need to bump the scroll call to the back of the callstack, since the dialog that
		// triggers this on close can influence the scroll window.
		setTimeout( () => {
			inputRef.current?.scrollIntoView( { behavior: 'smooth', block: 'start' } );
		} );
	}, [ isEmailChangePending ] );

	useEffect( () => {
		// Check for query param used to indicate a need to scroll to the input, this is added when
		// redirecting to this page for the purpose of email change.
		const focusEmail = currentQuery?.focusEmail;
		if ( focusEmail ) {
			scrollAndFocus();
			// Timeout to ensure this happens after the window url is updated, as this can run
			// before that.
			setTimeout( () =>
				window.history.replaceState( {}, '', removeQueryArgs( window.location.href, 'focusEmail' ) )
			);
		}
		// Listen for an event signalling to focus and scroll to the email field or button. This
		// happens when we are already on a page with the input and need to trigger the
		// functionality.
		emailFormEventEmitter.addEventListener( 'highlightInput', scrollAndFocus );
		return () => {
			emailFormEventEmitter.removeEventListener( 'highlightInput', scrollAndFocus );
		};
	}, [ scrollAndFocus, currentQuery ] );

	return (
		<>
			<FormFieldset>
				<FormLabel htmlFor={ emailInputId }>{ translate( 'Email address' ) }</FormLabel>
				<FormTextInput
					disabled={ isEmailControlDisabled || isEmailChangePending }
					id={ emailInputId }
					name={ emailInputName }
					isError={ emailInvalidReason !== EMAIL_VALIDATION_REASON_IS_VALID }
					onFocus={ onFocus }
					value={ emailAddress }
					onChange={ onEmailAddressChange }
					inputRef={ inputRef }
				/>

				<AccountEmailValidationNotice
					emailInvalidReason={ emailInvalidReason }
					unsavedUserSettings={ unsavedUserSettings }
					userSettings={ userSettings }
				/>

				{ emailInvalidReason === EMAIL_VALIDATION_REASON_IS_VALID && (
					<AccountEmailCustomDomainNotice email={ String( emailAddress ) } />
				) }

				<FormSettingExplanation>
					<EmailFieldExplanationText unlockRef={ unlockRef } />
				</FormSettingExplanation>
			</FormFieldset>
		</>
	);
};

export default AccountEmailField;
