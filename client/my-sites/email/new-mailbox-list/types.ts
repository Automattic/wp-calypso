import { PROVIDER_GOOGLE, PROVIDER_TITAN } from 'calypso/my-sites/email/new-mailbox-list/constants';
import type { TranslateResult } from 'i18n-calypso';

type FieldError = TranslateResult | null;
type FieldValue = string | boolean | null;

enum Provider {
	Google = PROVIDER_GOOGLE,
	Titan = PROVIDER_TITAN,
}

interface MailboxFormField {
	error: FieldError;
	value: FieldValue;
}

interface Mailbox {
	alternativeEmail: MailboxFormField;
	domain: MailboxFormField;
	firstName: MailboxFormField;
	isAdmin: MailboxFormField;
	lastName: MailboxFormField;
	mailbox: MailboxFormField;
	password: MailboxFormField;
	provider: Provider;
	uuid: string;
}

export type { FieldError, FieldValue, Mailbox, MailboxFormField, Provider, TranslateResult };
