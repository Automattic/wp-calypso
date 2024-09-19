import { FormInputValidation, FormLabel } from '@automattic/components';
import emailValidator from 'email-validator';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import QueryAllDomains from 'calypso/components/data/query-all-domains';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import Notice from 'calypso/components/notice';
import NoticeAction from 'calypso/components/notice/notice-action';
import { type as domainTypes } from 'calypso/lib/domains/constants';
import { useDispatch, useSelector } from 'calypso/state';
import isPendingEmailChange from 'calypso/state/selectors/is-pending-email-change';
import isRequestingAllDomains from 'calypso/state/selectors/is-requesting-all-domains';
import { getFlatDomainsList } from 'calypso/state/sites/domains/selectors';
import {
	cancelPendingEmailChange,
	removeUnsavedUserSetting,
	setUserSetting,
} from 'calypso/state/user-settings/actions';
import EmailNotVerifiedNotice from './email-not-verified-notice';
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

	return (
		<>
			<QueryAllDomains />
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
				/>

				<AccountEmailValidationNotice
					emailInvalidReason={ emailInvalidReason }
					unsavedUserSettings={ unsavedUserSettings }
					userSettings={ userSettings }
				/>

				<FormSettingExplanation>
					{ translate( 'Not publicly displayed, except to owners of sites you subscribe to.' ) }
				</FormSettingExplanation>

				<EmailNotVerifiedNotice />

				<AccountEmailPendingEmailChangeNotice
					unsavedUserSettings={ unsavedUserSettings }
					userSettings={ userSettings }
				/>
			</FormFieldset>
		</>
	);
};

export default AccountEmailField;
