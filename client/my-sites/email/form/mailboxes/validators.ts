import emailValidator from 'email-validator';
import i18n from 'i18n-calypso';
import React from 'react';
import type { FieldError, MailboxFormFieldBase } from 'calypso/my-sites/email/form/mailboxes/types';

interface Validator< T > {
	validate( field?: MailboxFormFieldBase< T > ): void;
}

class RequiredValidator< T > implements Validator< T > {
	validate( field?: MailboxFormFieldBase< T > ): void {
		if ( ! field || field.error || ! field.isRequired ) {
			return;
		}

		const requiredFieldError = i18n.translate( 'This field is required.' );

		if ( ! field.value ) {
			field.error = requiredFieldError;

			return;
		}

		if ( typeof field.value === 'string' && field.value.trim() === '' ) {
			field.error = requiredFieldError;
		}
	}
}

class RequiredIfVisibleValidator extends RequiredValidator< string > {
	validate( field?: MailboxFormFieldBase< string > ): void {
		if ( ! field || field.error || ! field.isVisible ) {
			return;
		}

		super.validate( field );
	}
}

class MaximumStringLengthValidator implements Validator< string > {
	private readonly maximumStringLength: number;

	constructor( maximumStringLength: number ) {
		this.maximumStringLength = maximumStringLength;
	}

	validate( field?: MailboxFormFieldBase< string > ): void {
		if ( ! field || field.error ) {
			return;
		}

		if ( this.maximumStringLength < ( field.value?.length ?? 0 ) ) {
			field.error = i18n.translate( "This field can't be longer than %s characters.", {
				args: this.maximumStringLength,
			} );
		}
	}
}

class MailboxNameValidator implements Validator< string > {
	domainName: string;
	mailboxHasDomainError: boolean;
	supportsApostrophes: boolean;

	constructor( domainName: string, mailboxHasDomainError: boolean, supportsApostrophes: boolean ) {
		this.domainName = domainName;
		this.mailboxHasDomainError = mailboxHasDomainError;
		this.supportsApostrophes = supportsApostrophes;
	}

	static getUnsupportedCharacterError( supportsApostrophes: boolean ): FieldError {
		return supportsApostrophes
			? i18n.translate(
					'Only numbers, letters, dashes, underscores, apostrophes and periods are allowed.'
			  )
			: i18n.translate( 'Only numbers, letters, dashes, underscores, and periods are allowed.' );
	}

	validate( field?: MailboxFormFieldBase< string > ): void {
		if ( ! field || field.error ) {
			return;
		}

		const regex = this.supportsApostrophes
			? /^[\da-z_'-](\.?[\da-z_'-])*$/i
			: /^[\da-z_-](\.?[\da-z_-])*$/i;

		if ( ! regex.test( field.value ) ) {
			field.error = MailboxNameValidator.getUnsupportedCharacterError( this.supportsApostrophes );
			return;
		}

		if (
			this.domainName &&
			! this.mailboxHasDomainError &&
			! emailValidator.validate( `${ field.value }@${ this.domainName }` )
		) {
			field.error = i18n.translate( 'Please supply a valid email address.' );
			return;
		}
	}
}

class AlternateEmailValidator implements Validator< string > {
	domainName: string;

	constructor( domainName: string ) {
		this.domainName = domainName;
	}

	static getSameDomainError( domainName: string ): FieldError {
		return i18n.translate(
			'This email address must have a different domain than {{strong}}%(domain)s{{/strong}}. Please use a different email address.',
			{
				args: {
					domain: domainName,
				},
				components: {
					strong: React.createElement( 'strong' ),
				},
			}
		);
	}

	validate( field?: MailboxFormFieldBase< string > ): void {
		if ( ! field || field.error || ! field.value || field.value.trim() === '' ) {
			return;
		}

		const value = `${ field.value }`;

		if ( ! emailValidator.validate( value ) ) {
			field.error = i18n.translate( 'Please supply a valid email address.' );

			return;
		}

		const parts = `${ value }`.split( '@' );

		if (
			this.domainName &&
			parts.length > 1 &&
			parts[ 1 ].toLowerCase() === this.domainName?.toLowerCase()
		) {
			field.error = AlternateEmailValidator.getSameDomainError( this.domainName );
		}
	}
}

class PasswordValidator implements Validator< string > {
	private readonly minimumPasswordLength: number;

	constructor( minimumPasswordLength: number ) {
		this.minimumPasswordLength = minimumPasswordLength;
	}

	validate( field?: MailboxFormFieldBase< string > ): void {
		if ( ! field || field.error ) {
			return;
		}

		const value = field.value;

		if ( this.minimumPasswordLength > value.length ) {
			field.error = i18n.translate( "This field can't be shorter than %s characters.", {
				args: String( this.minimumPasswordLength ),
			} );
			return;
		}

		if ( 100 < value.length ) {
			field.error = i18n.translate( "This field can't be longer than %s characters.", {
				args: '100',
			} );
			return;
		}

		if ( value.startsWith( ' ' ) ) {
			field.error = i18n.translate( "This field can't start with a white space." );
			return;
		}

		// Checks that passwords only have ASCII characters (see https://en.wikipedia.org/wiki/ASCII#Character_set)
		const regexp = /[^\x20-\x7E]/;

		if ( regexp.test( value ) ) {
			const firstForbiddenCharacter = [ ...value ].find( ( character ) =>
				regexp.test( character )
			);

			field.error = i18n.translate( "This field can't accept '%s' as character.", {
				args: firstForbiddenCharacter,
				comment: '%s denotes a single character that is not allowed in this field',
			} );
			return;
		}

		if ( value.endsWith( ' ' ) ) {
			field.error = i18n.translate( "This field can't end with a white space." );
		}
	}
}

class ExistingMailboxNamesValidator implements Validator< string > {
	existingMailboxNames: string[];

	constructor( existingMailboxNames: string[] ) {
		this.existingMailboxNames = existingMailboxNames;
	}

	static getExistingMailboxError(): FieldError {
		return i18n.translate( 'Please use unique mailboxes' );
	}

	validate( field?: MailboxFormFieldBase< string > ): void {
		if ( ! field || field.error ) {
			return;
		}

		const existingMailboxNames = this.existingMailboxNames ?? [];
		if ( ! existingMailboxNames ) {
			return;
		}

		if (
			existingMailboxNames
				.map( ( item ) => item.toLowerCase() )
				.includes( field.value?.toLowerCase() ?? '' )
		) {
			field.error = ExistingMailboxNamesValidator.getExistingMailboxError();
		}
	}
}

export type { Validator };

export {
	AlternateEmailValidator,
	ExistingMailboxNamesValidator,
	MailboxNameValidator,
	PasswordValidator,
	RequiredValidator,
	RequiredIfVisibleValidator,
	MaximumStringLengthValidator,
};
