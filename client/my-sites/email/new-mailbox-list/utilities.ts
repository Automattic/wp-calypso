import emailValidator from 'email-validator';
import { translate } from 'i18n-calypso';
import React from 'react';
import { v4 as uuid_v4 } from 'uuid';
import { validatePasswordField } from 'calypso/lib/gsuite/new-users';
import {
	FIELD_ALTERNATIVE_EMAIL,
	FIELD_DOMAIN,
	FIELD_FIRSTNAME,
	FIELD_IS_ADMIN,
	FIELD_LASTNAME,
	FIELD_MAILBOX,
	FIELD_PASSWORD,
	FIELD_UUID,
} from 'calypso/my-sites/email/new-mailbox-list/constants';
import type {
	Mailbox,
	MailboxField,
	Nullable,
	StringOrBoolean,
	TranslateResult,
} from 'calypso/my-sites/email/new-mailbox-list/types';

export const sanitizeValueForEmail = ( value: string ) =>
	String( value )
		.replace( /[^\da-z_'.-]/gi, '' )
		.toLowerCase();

const getNewMailboxField = (
	value: StringOrBoolean = '',
	error: Nullable< TranslateResult > = null
): MailboxField => ( { value, error } );

export const getNewMailbox = ( domain: string ): Mailbox => {
	return {
		[ FIELD_ALTERNATIVE_EMAIL ]: getNewMailboxField(),
		[ FIELD_DOMAIN ]: getNewMailboxField( domain ),
		[ FIELD_FIRSTNAME ]: getNewMailboxField(),
		[ FIELD_IS_ADMIN ]: getNewMailboxField( false ),
		[ FIELD_LASTNAME ]: getNewMailboxField(),
		[ FIELD_MAILBOX ]: getNewMailboxField(),
		[ FIELD_PASSWORD ]: getNewMailboxField(),
		[ FIELD_UUID ]: uuid_v4(),
	};
};

/**
 * Returns a new field with all previous errors cleared
 */
const removePreviousErrors = ( { value }: MailboxField ): MailboxField =>
	getNewMailboxField( value );

const mapMailboxFields = (
	mailbox: Mailbox,
	callback: ( fieldValue: MailboxField, fieldName: string, mailbox: Mailbox ) => MailboxField,
	skipFields: string[] = []
): Mailbox => {
	const updatedEntries = ( Object.entries( mailbox ) as [ string, MailboxField ][] ).map(
		( [ fieldName, fieldValue ] ) => {
			if ( fieldName === FIELD_UUID || skipFields.includes( fieldName ) ) {
				return [ fieldName, fieldValue ];
			}

			return [ fieldName, callback( fieldValue, fieldName, mailbox ) ];
		}
	);

	return Object.fromEntries( updatedEntries );
};

/**
 * Clears all previous errors from all fields for each included mailbox.
 */
const clearPreviousErrors = ( mailboxes: Mailbox[] ): Mailbox[] => {
	return mailboxes.map( ( mailbox ) => mapMailboxFields( mailbox, removePreviousErrors ) );
};

const validateRequiredField = ( { value, error }: MailboxField ): MailboxField =>
	getNewMailboxField(
		value,
		! error && typeof value !== 'boolean' && ( ! value || '' === value.trim() )
			? translate( 'This field is required.' )
			: error
	);

/**
 * Validate that a mailbox has all required fields.
 */
const validateRequiredMailboxFields = ( mailbox: Mailbox, optionalFields: string[] = [] ) => {
	return mapMailboxFields( mailbox, validateRequiredField, optionalFields );
};

/**
 * Validate an email address to check that it is valid.
 */
const validateFullEmailAddress = ( { value, error }: MailboxField, allowEmpty = false ) => {
	if ( error ) {
		return getNewMailboxField( value, error );
	}
	if ( allowEmpty && value === '' ) {
		return getNewMailboxField( value, error );
	}
	if ( emailValidator.validate( value as string ) ) {
		return getNewMailboxField( value, error );
	}

	return getNewMailboxField( value, translate( 'Please supply a valid email address.' ) );
};

/**
 * Validate the alternative email address.
 */
const validateAlternativeEmailAddress = (
	{ value, error }: MailboxField,
	domainName: string,
	allowEmpty = false
) => {
	if ( ! error && value && domainName ) {
		const parts = `${ value }`.split( '@' );
		if ( parts.length > 1 && parts[ 1 ].toLowerCase() === domainName.toLowerCase() ) {
			return getNewMailboxField(
				value,
				translate(
					'This email address must have a different domain than {{strong}}%(domain)s{{/strong}}. Please use a different email address.',
					{
						args: {
							domain: domainName,
						},
						components: {
							strong: React.createElement( 'strong' ),
						},
					}
				)
			);
		}
	}

	return validateFullEmailAddress( { value, error }, allowEmpty );
};

const validateMailboxName = (
	{ value, error }: MailboxField,
	{ value: domainName, error: domainError }: MailboxField
) => {
	if ( error ) {
		return getNewMailboxField( value, error );
	}
	if ( ! /^[\da-z_-](\.?[\da-z_-])*$/i.test( value as string ) ) {
		return getNewMailboxField(
			value,
			translate( 'Only numbers, letters, dashes, underscores, and periods are allowed.' )
		);
	}
	if ( ! domainError && domainName && ! emailValidator.validate( `${ value }@${ domainName }` ) ) {
		return getNewMailboxField( value, translate( 'Please supply a valid email address.' ) );
	}
	return getNewMailboxField( value, error );
};

const validateName = ( { value, error }: MailboxField ) => {
	// TODO: validate the user's name
	return { value, error };
};

const validatePassword = ( { value, error }: MailboxField ) =>
	validatePasswordField( { value: value as string, error }, 10 );

/**
 * Validate that mailboxes don't contain duplicate mailbox names.
 */
const validateMailboxesAreUnique = ( mailboxes: Mailbox[] ): Mailbox[] => {
	const mailboxNameCounts = mailboxes.reduce( ( nameCount, mailbox ) => {
		const mailboxName = mailbox.mailbox.value as string;
		nameCount[ mailboxName ] = 1 + ( nameCount[ mailboxName ] ?? 0 );
		return nameCount;
	}, {} as { [ key: string ]: number } );

	return mailboxes.map( ( mailbox ) => {
		const mailboxName = mailbox.mailbox.value as string;
		if ( mailboxNameCounts[ mailboxName ] > 1 ) {
			return {
				...mailbox,
				[ FIELD_MAILBOX ]: getNewMailboxField(
					mailboxName,
					translate( 'Please use unique mailboxes' )
				),
			};
		}
		return mailbox;
	} );
};

const validateMailbox = ( mailbox: Mailbox, optionalFields: string[] = [] ): Mailbox => {
	const {
		alternativeEmail,
		domain,
		mailbox: mailboxName,
		firstName,
		isAdmin,
		lastName,
		password,
	} = validateRequiredMailboxFields( mailbox, optionalFields );

	return {
		[ FIELD_UUID ]: mailbox.uuid,
		[ FIELD_ALTERNATIVE_EMAIL ]: validateAlternativeEmailAddress(
			alternativeEmail,
			domain.value as string,
			optionalFields.includes( FIELD_ALTERNATIVE_EMAIL )
		),
		[ FIELD_DOMAIN ]: domain,
		[ FIELD_MAILBOX ]: validateMailboxName( mailboxName, domain ),
		[ FIELD_FIRSTNAME ]: validateName( firstName ),
		[ FIELD_IS_ADMIN ]: isAdmin,
		[ FIELD_LASTNAME ]: validateName( lastName ),
		[ FIELD_PASSWORD ]: validatePassword( password ),
	};
};

export const validateMailboxes = (
	mailboxes: Mailbox[],
	extraValidation: ( mailbox: Mailbox ) => Mailbox = ( mailbox ) => mailbox,
	optionalFields: string[] = []
) => {
	return validateMailboxesAreUnique( clearPreviousErrors( mailboxes ) )
		.map( ( mailbox: Mailbox ) => validateMailbox( mailbox, optionalFields ) )
		.map( extraValidation );
};
