import { FormInputValidation, FormLabel } from '@automattic/components';
import { Button } from '@wordpress/components';
import emailValidator from 'email-validator';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useRef, useState } from 'react';
import QueryAllDomains from 'calypso/components/data/query-all-domains';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { type as domainTypes } from 'calypso/lib/domains/constants';
import { useDispatch, useSelector } from 'calypso/state';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
import isPendingEmailChange from 'calypso/state/selectors/is-pending-email-change';
import isRequestingAllDomains from 'calypso/state/selectors/is-requesting-all-domains';
import { getFlatDomainsList } from 'calypso/state/sites/domains/selectors';
import {
	cancelPendingEmailChange,
	removeUnsavedUserSetting,
	setUserSetting,
} from 'calypso/state/user-settings/actions';
import type { ResponseDomain } from 'calypso/lib/domains/types';
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

// TODO - remove this component
const AccountEmailPendingEmailChangeNotice = ( {
	unsavedUserSettings,
	userSettings,
}: {
	unsavedUserSettings: UserSettingsType;
	userSettings: UserSettingsType;
} ) => {
	const dispatch = useDispatch();
	const translate = useTranslate();

	const domainsList: ResponseDomain[] = useSelector( getFlatDomainsList );
	const isRequestingDomainList = useSelector( isRequestingAllDomains );
	const isEmailChangePending = useSelector( isPendingEmailChange );

	if ( ! isEmailChangePending ) {
		return null;
	}

	const editContactInfoInBulkUrl = `/domains/manage?site=all&action=edit-contact-email`;
	const email = getUserSetting( {
		settingName: 'new_user_email',
		unsavedUserSettings,
		userSettings,
	} ) as string;

	const hasCustomDomainRegistration = domainsList.some( ( domain ) => {
		return domainTypes.REGISTERED === domain.type;
	} );

	const noticeText =
		isRequestingDomainList || ! hasCustomDomainRegistration
			? translate(
					'Your email change is pending. Please take a moment to check %(email)s for an email with the subject "[WordPress.com] New Email Address" to confirm your change.',
					{
						args: { email },
					}
			  )
			: translate(
					'Your email change is pending. Please take a moment to:{{br/}}1. Check %(email)s for an email with the subject "[WordPress.com] New Email Address" to confirm your change.{{br/}}2. Update contact information on your domain names if necessary {{link}}here{{/link}}.',
					{
						args: {
							email,
						},
						components: {
							br: <br />,
							link: <a href={ editContactInfoInBulkUrl } />,
						},
					}
			  );

	return (
		<Notice
			className="account-email-field__change-pending"
			showDismiss={ false }
			status="is-info"
			text={ noticeText }
		>
			<NoticeAction onClick={ () => dispatch( cancelPendingEmailChange() ) }>
				{ translate( 'Cancel' ) }
			</NoticeAction>
		</Notice>
	);
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
	const dispatch = useDispatch();
	const translate = useTranslate();
	const isEmailChangePending = useSelector( isPendingEmailChange );
	const isEmailVerifified = useSelector( isCurrentUserEmailVerified );
	const inputRef = useRef< FormTextInput >( null );
	const [ isLockedInput, setIsLockedInput ] = useState( true );
	const [ emailSettingToShow, setEmailSettingToShow ] = useState( 'user_email' );
	const [ emailInvalidReason, setEmailInvalidReason ] = useState< AccountEmailValidationReason >(
		EMAIL_VALIDATION_REASON_IS_VALID
	);

	useEffect( () => {
		// Ensure that we remove any unsaved changes to the email address when we unmount
		return (): void => {
			dispatch( removeUnsavedUserSetting( 'user_email' ) );
		};
	}, [ dispatch ] );

	// If the isEmailChangePending updates to true, show the new email address field. This may
	// happen just after initial load, as the selector may return null at first. Or this may happen
	// after the user saves the form with an updated email address.
	useEffect( () => {
		if ( isEmailChangePending ) {
			setEmailSettingToShow( 'new_user_email' );
		}
	}, [ isEmailChangePending ] );

	// Once the user starts editing, ensure we show the user_email field since that is the one being
	// updated in unsavedUserSettings. We don't want this to reset when the unsaved change renders falsy, as we want to
	// both support the case of the empty string as well as when the unsaved settings are reset for
	// having the same value as the saved settigns (user types in current user_email and unsaved
	// variation gets reset to null).
	useEffect( () => {
		if ( unsavedUserSettings.user_email ) {
			setEmailSettingToShow( 'user_email' );
		}
	}, [ unsavedUserSettings.user_email, setEmailSettingToShow ] );

	const emailAddress = getUserSetting( {
		settingName: emailSettingToShow,
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

	const focusInput = () => {
		inputRef.current?.focus();
	};

	// Ensure input is focused when it is triggered to unlock.
	useEffect( () => {
		if ( ! isLockedInput ) {
			focusInput();
		}
	}, [ isLockedInput ] );

	// Allow unlocking the email field from an external source such as the email verification dialog
	// when it appears on this page.
	useEffect( () => {
		const unlockHandler = () => {
			setIsLockedInput( false );
			focusInput();
		};

		emailFormEventEmitter.addEventListener( 'unlockEmailInput', unlockHandler );

		return () => {
			emailFormEventEmitter.removeEventListener( 'unlockEmailInput', unlockHandler );
		};
	}, [] );

	const unlockWrapper = (
		<Button
			className="account-email-field__enable-input"
			variant="link"
			onClick={ ( ev: React.MouseEvent< HTMLButtonElement > ) => {
				ev.preventDefault();
				setIsLockedInput( false );
				// Ensure input is focused when the user clicks
				// this, regardless of if it was previously
				// locked or not.
				focusInput();
			} }
		/>
	);

	return (
		<>
			<QueryAllDomains />
			<FormFieldset>
				<FormLabel htmlFor={ emailInputId }>{ translate( 'Email address' ) }</FormLabel>
				<FormTextInput
					disabled={ isEmailControlDisabled || isLockedInput }
					id={ emailInputId }
					name={ emailInputName }
					isError={ emailInvalidReason !== EMAIL_VALIDATION_REASON_IS_VALID }
					onFocus={ onFocus }
					value={ emailAddress }
					onChange={ onEmailAddressChange }
					ref={ inputRef }
				/>

				<AccountEmailValidationNotice
					emailInvalidReason={ emailInvalidReason }
					unsavedUserSettings={ unsavedUserSettings }
					userSettings={ userSettings }
				/>

				<FormSettingExplanation>
					{ isEmailVerifified && ! isEmailChangePending
						? translate(
								'Not publicly displayed, except to owners of sites you subscribe to. {{wrapper}}Click here to update it{{/wrapper}}.',
								{
									components: {
										wrapper: unlockWrapper,
									},
								}
						  )
						: translate(
								'Your email has not been verified yet. Need to update your address? {{wrapper}}Click here to update it{{/wrapper}}.',
								{
									components: {
										wrapper: unlockWrapper,
									},
								}
						  ) }
				</FormSettingExplanation>
			</FormFieldset>
		</>
	);
};

export default AccountEmailField;
