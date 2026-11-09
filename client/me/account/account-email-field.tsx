import { FormInputValidation, FormLabel } from '@automattic/components';
import {
	getEmailAddressError,
	hasVerifiedAccountRecovery,
	isAccountEmailAtRisk,
} from '@automattic/onboarding';
import { Button } from '@wordpress/components';
import { removeQueryArgs } from '@wordpress/url';
import { useTranslate } from 'i18n-calypso';
import { useCallback, useEffect, useRef, useState } from 'react';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import wpcom from 'calypso/lib/wp';
import { useDispatch, useSelector, useStore } from 'calypso/state';
import { accountRecoverySettingsFetch } from 'calypso/state/account-recovery/settings/actions';
import {
	getAccountRecoveryEmail,
	getAccountRecoveryPhone,
	isAccountRecoveryEmailValidated,
	isAccountRecoveryPhoneValidated,
	isAccountRecoverySettingsReady,
} from 'calypso/state/account-recovery/settings/selectors';
import { getCurrentUserId, isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import getCurrentQueryArguments from 'calypso/state/selectors/get-current-query-arguments';
import isPendingEmailChange from 'calypso/state/selectors/is-pending-email-change';
import {
	cancelPendingEmailChange,
	fetchUserSettingsSuccess,
	removeUnsavedUserSetting,
	setUserSetting,
} from 'calypso/state/user-settings/actions';
import {
	isFetchingUserSettings,
	isUpdatingUserSettings,
} from 'calypso/state/user-settings/selectors';
import AccountEmailRecoveryNotice from './account-email-recovery-notice';
import type { UserSettingsType } from 'calypso/state/selectors/get-user-settings';
import type { ChangeEvent } from 'react';

import './account-email-field.scss';

export type AccountEmailFieldProps = {
	emailInputId?: string;
	emailInputName?: string;
	hasUnsavedChanges?: boolean;
	emailValidationHandler?: ( isEmailValid: boolean ) => void;
	isEmailControlDisabled?: boolean;
	onEmailChange?: ( isEmailModified: boolean ) => void;
	onFocus?: () => void;
	unsavedUserSettings?: UserSettingsType;
	userSettings?: UserSettingsType;
};

const EMAIL_VALIDATION_REASON_EMPTY = 'empty';
const EMAIL_VALIDATION_REASON_INVALID = 'invalid';
const EMAIL_VALIDATION_REASON_UNKNOWN_TLD = 'unknown_tld';
const EMAIL_VALIDATION_REASON_IS_VALID = null;

type AccountEmailValidationReason =
	| typeof EMAIL_VALIDATION_REASON_EMPTY
	| typeof EMAIL_VALIDATION_REASON_INVALID
	| typeof EMAIL_VALIDATION_REASON_UNKNOWN_TLD
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

	const email = getUserSetting( {
		settingName: 'user_email',
		unsavedUserSettings,
		userSettings,
	} ) as string;

	let noticeText;

	if ( emailInvalidReason === EMAIL_VALIDATION_REASON_EMPTY ) {
		noticeText = translate( 'Email address can not be empty.' );
	} else if ( emailInvalidReason === EMAIL_VALIDATION_REASON_INVALID ) {
		noticeText = translate( '%(email)s is not a valid email address.', { args: { email } } );
	} else if ( emailInvalidReason === EMAIL_VALIDATION_REASON_UNKNOWN_TLD ) {
		noticeText = translate(
			'“%(domain)s” doesn’t look like a real domain. Check the address for typos.',
			{ args: { domain: getEmailDomain( email ) ?? email } }
		);
	}

	return <FormInputValidation isError text={ noticeText } />;
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
	hasUnsavedChanges = false,
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
	const store = useStore();
	const userId = useSelector( getCurrentUserId );
	const recoveryIsReady = useSelector( isAccountRecoverySettingsReady );
	const recoveryEmail = useSelector( getAccountRecoveryEmail );
	const recoveryPhone = useSelector( getAccountRecoveryPhone );
	const recoveryEmailVerified = useSelector( isAccountRecoveryEmailValidated );
	const recoveryPhoneVerified = useSelector( isAccountRecoveryPhoneValidated );
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

	const savedEmail = String( userSettings.user_email ?? '' );
	const isDraft = ! isEmailChangePending && String( emailAddress ) !== savedEmail;
	const warningEmail = isDraft ? String( emailAddress ) : savedEmail;
	const verifiedRecovery = recoveryIsReady
		? {
				verifiedEmail: recoveryEmailVerified ? recoveryEmail : undefined,
				hasVerifiedPhone: !! recoveryPhone?.number && recoveryPhoneVerified === true,
			}
		: undefined;
	const showRecoveryWarning =
		isAccountEmailAtRisk( warningEmail ) &&
		( isDraft || recoveryIsReady ) &&
		! hasVerifiedAccountRecovery( warningEmail, verifiedRecovery );

	useEffect( () => {
		dispatch( accountRecoverySettingsFetch( { quiet: true } ) );

		let active = true;
		let isRefreshingPendingEmail = false;
		const refreshOnFocus = async () => {
			if ( document.visibilityState !== 'visible' ) {
				return;
			}

			dispatch( accountRecoverySettingsFetch( { quiet: true } ) );
			const state = store.getState();
			const pendingEmail = isPendingEmailChange( state );
			if (
				! pendingEmail ||
				isRefreshingPendingEmail ||
				isFetchingUserSettings( state ) ||
				isUpdatingUserSettings( state )
			) {
				return;
			}

			isRefreshingPendingEmail = true;
			try {
				const { user_email, new_user_email, user_email_change_pending } = await wpcom.req.get(
					'/me/settings',
					{ fields: 'user_email,new_user_email,user_email_change_pending' }
				);
				const latestState = store.getState();
				// A cancel or a newer email change may have completed while this read was in flight.
				if (
					active &&
					typeof user_email === 'string' &&
					new_user_email === '' &&
					user_email_change_pending === false &&
					isPendingEmailChange( latestState ) === pendingEmail &&
					! isFetchingUserSettings( latestState ) &&
					! isUpdatingUserSettings( latestState )
				) {
					dispatch(
						fetchUserSettingsSuccess( { user_email, new_user_email, user_email_change_pending } )
					);
				}
			} catch {
				// The next focus or page load can retry.
			} finally {
				isRefreshingPendingEmail = false;
			}
		};

		window.addEventListener( 'focus', refreshOnFocus );
		return () => {
			active = false;
			window.removeEventListener( 'focus', refreshOnFocus );
		};
	}, [ dispatch, store, userId ] );

	const onEmailAddressChange = ( event: ChangeEvent< HTMLInputElement > ): void => {
		const { value } = event.target;

		let emailValidationReason: AccountEmailValidationReason = EMAIL_VALIDATION_REASON_IS_VALID;

		const emailError = getEmailAddressError( value );

		if ( value === '' ) {
			emailValidationReason = EMAIL_VALIDATION_REASON_EMPTY;
		} else if ( emailError === 'unknown_tld' ) {
			emailValidationReason = EMAIL_VALIDATION_REASON_UNKNOWN_TLD;
		} else if ( emailError ) {
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

				<AccountEmailRecoveryNotice
					key={ userId }
					savedEmail={ savedEmail }
					show={ showRecoveryWarning }
					isDraft={ isDraft }
					isPending={ !! isEmailChangePending }
					recoveryIsReady={ recoveryIsReady }
					openInNewTab={ hasUnsavedChanges || isDraft }
				/>

				<FormSettingExplanation>
					<EmailFieldExplanationText unlockRef={ unlockRef } />
				</FormSettingExplanation>
			</FormFieldset>
		</>
	);
};

export default AccountEmailField;
