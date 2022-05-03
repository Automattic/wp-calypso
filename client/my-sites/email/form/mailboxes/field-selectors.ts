import { TranslateResult } from 'i18n-calypso';
import { MailboxForm } from 'calypso/my-sites/email/form/mailboxes/index';
import {
	EmailProvider,
	FormFieldNames,
	GoogleMailboxFormFields,
	MailboxFormFieldBase,
	TitanMailboxFormFields,
} from 'calypso/my-sites/email/form/mailboxes/types';

const getFormField = (
	mailbox: MailboxForm< EmailProvider >,
	fieldName: FormFieldNames
): MailboxFormFieldBase< string | boolean > => {
	const formFields: GoogleMailboxFormFields | TitanMailboxFormFields = mailbox.formFields;
	return Reflect.get( formFields, fieldName );
};

const getFormFieldValue = (
	mailbox: MailboxForm< EmailProvider >,
	fieldName: FormFieldNames
): string | boolean => getFormField( mailbox, fieldName )?.value;

const getFormFieldError = (
	mailbox: MailboxForm< EmailProvider >,
	fieldName: FormFieldNames
): TranslateResult | null => getFormField( mailbox, fieldName )?.error;

const getFormFieldIsVisible = (
	mailbox: MailboxForm< EmailProvider >,
	fieldName: FormFieldNames
): boolean => Boolean( getFormField( mailbox, fieldName )?.isVisible );

export { getFormField, getFormFieldValue, getFormFieldError, getFormFieldIsVisible };
