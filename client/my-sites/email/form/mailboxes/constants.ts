/**
 * Field names.
 * Used in forms to identify common fields across providers
 */
export const FIELD_ALTERNATIVE_EMAIL = 'alternativeEmail';
export const FIELD_DOMAIN = 'domain';
export const FIELD_FIRSTNAME = 'firstName';
export const FIELD_LASTNAME = 'lastName';
export const FIELD_IS_ADMIN = 'isAdmin';
export const FIELD_MAILBOX = 'mailbox';
export const FIELD_NAME = 'name';
export const FIELD_PASSWORD = 'password';
export const FIELD_RECOVERY_EMAIL = 'recoveryEmail';
export const FIELD_UUID = 'uuid';

export type TitanMailboxFields = {
	[ FIELD_DOMAIN ]: string;
	[ FIELD_NAME ]: string;
	[ FIELD_MAILBOX ]: string;
	[ FIELD_PASSWORD ]: string;
	[ FIELD_ALTERNATIVE_EMAIL ]: string;
	[ FIELD_IS_ADMIN ]: boolean;
};
