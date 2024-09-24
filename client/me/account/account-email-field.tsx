import { FormInputValidation, FormLabel } from '@automattic/components';
import { Button } from '@wordpress/components';
import emailValidator from 'email-validator';
import { useTranslate } from 'i18n-calypso';
import { useEffect, useState } from 'react';
import QueryAllDomains from 'calypso/components/data/query-all-domains';
import FormFieldset from 'calypso/components/forms/form-fieldset';
import FormSettingExplanation from 'calypso/components/forms/form-setting-explanation';
import FormTextInput from 'calypso/components/forms/form-text-input';
import { useDispatch, useSelector } from 'calypso/state';
import { isCurrentUserEmailVerified } from 'calypso/state/current-user/selectors';
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

const EmailFieldExplanationText = () => {
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
					<EmailFieldExplanationText />
				</FormSettingExplanation>
			</FormFieldset>
		</>
	);
};

export default AccountEmailField;
