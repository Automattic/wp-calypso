import { PROVIDER_GOOGLE, PROVIDER_TITAN } from 'calypso/my-sites/email/new-mailbox-list/constants';
import type { TranslateResult } from 'i18n-calypso';

type FieldError = TranslateResult | null;
type FieldValue = string | boolean | null;

enum Provider {
	Google = PROVIDER_GOOGLE,
	Titan = PROVIDER_TITAN,
}

interface MailboxField {
	error: FieldError;
	value: FieldValue;
}

interface Mailbox {
	alternativeEmail: MailboxField;
	domain: MailboxField;
	firstName: MailboxField;
	isAdmin: MailboxField;
	lastName: MailboxField;
	mailbox: MailboxField;
	password: MailboxField;
	provider: Provider;
	uuid: string;
}

export type { FieldError, FieldValue, Mailbox, MailboxField, Provider, TranslateResult };
