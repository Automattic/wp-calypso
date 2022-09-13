import { useTranslate } from 'i18n-calypso';
import {
	FIELD_ALTERNATIVE_EMAIL,
	FIELD_FIRSTNAME,
	FIELD_IS_ADMIN,
	FIELD_LASTNAME,
	FIELD_MAILBOX,
	FIELD_NAME,
	FIELD_PASSWORD,
	FIELD_RECOVERY_EMAIL,
} from 'calypso/my-sites/email/form/mailboxes/constants';
import type { MutableFormFieldNames } from 'calypso/my-sites/email/form/mailboxes/types';
import type { TranslateResult } from 'i18n-calypso';

export const useGetDefaultFieldLabelText = (
	fieldName: MutableFormFieldNames
): TranslateResult => {
	const translate = useTranslate();

	const textMap: Record< MutableFormFieldNames, TranslateResult > = {
		[ FIELD_ALTERNATIVE_EMAIL ]: translate( 'Password reset email address', {
			comment: 'This is the email address we will send password reset emails to',
		} ),
		[ FIELD_RECOVERY_EMAIL ]: translate( 'Password reset email address', {
			comment: 'This is the email address we will send password reset emails to',
		} ),
		[ FIELD_FIRSTNAME ]: translate( 'First name' ),
		[ FIELD_IS_ADMIN ]: translate( 'Is admin?' ),
		[ FIELD_LASTNAME ]: translate( 'Last name' ),
		[ FIELD_MAILBOX ]: translate( 'Email address' ),
		[ FIELD_NAME ]: translate( 'Full name' ),
		[ FIELD_PASSWORD ]: translate( 'Password' ),
	};

	return textMap[ fieldName ];
};
