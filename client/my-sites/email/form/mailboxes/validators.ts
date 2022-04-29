import emailValidator from 'email-validator';
import i18n, { translate } from 'i18n-calypso';
import React from 'react';
import type { MailboxFormFieldBase } from 'calypso/my-sites/email/form/mailboxes/types';

interface Validator< T > {
	validate( field?: MailboxFormFieldBase< T > ): void;
}

class RequiredValidator< T > implements Validator< T > {
	validate( field?: MailboxFormFieldBase< T > ): void {
		if ( ! field || field.error ) {
			return;
		}

		const requiredFieldError = i18n.translate( 'This field is required.' );

		if ( ! field.value ) {
			field.error = requiredFieldError;
		}

		if ( typeof field.value === 'string' && field.value.trim() === '' ) {
			field.error = requiredFieldError;
		}
	}
}

class StringLengthValidator implements Validator< string > {
	private readonly minimumStringLength: number;

	constructor( minimumStringLength: number ) {
		this.minimumStringLength = minimumStringLength;
	}

	validate( field?: MailboxFormFieldBase< string > ): void {
		if ( ! field || field.error ) {
			return;
		}

		if ( this.minimumStringLength < ( field.value?.length ?? 0 ) ) {
			field.error = translate( "This field can't be longer than %s characters.", {
				args: this.minimumStringLength,
			} );
		}
	}
}

class MailboxNameValidator implements Validator< string > {
	domainName: string;
	mailboxHasDomainError: boolean;

	constructor( domainName: string, mailboxHasDomainError: boolean ) {
		this.domainName = domainName;
		this.mailboxHasDomainError = mailboxHasDomainError;
	}

	validate( field?: MailboxFormFieldBase< string > ): void {
		if ( ! field || field.error ) {
			return;
		}

		if ( ! /^[\da-z_-](\.?[\da-z_-])*$/i.test( field.value ) ) {
			field.error = i18n.translate(
				'Only numbers, letters, dashes, underscores, and periods are allowed.'
			);
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
			field.error = i18n.translate(
				'This email address must have a different domain than {{strong}}%(domain)s{{/strong}}. Please use a different email address.',
				{
					args: {
						domain: this.domainName,
					},
					components: {
						strong: React.createElement( 'strong' ),
					},
				}
			);
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

class ExistingMailboxesValidator implements Validator< string > {
	existingMailboxes: string[];

	constructor( existingMailboxes: string[] ) {
		this.existingMailboxes = existingMailboxes;
	}

	validate( field?: MailboxFormFieldBase< string > ): void {
		if ( ! field || field.error ) {
			return;
		}

		const existingMailboxes = this.existingMailboxes ?? [];
		if ( ! existingMailboxes ) {
			return;
		}

		if (
			existingMailboxes
				.map( ( item ) => item.toLowerCase() )
				.includes( field.value?.toLowerCase() ?? '' )
		) {
			field.error = i18n.translate( 'Please use unique mailboxes' );
		}
	}
}

export type { Validator };

export {
	AlternateEmailValidator,
	ExistingMailboxesValidator,
	MailboxNameValidator,
	PasswordValidator,
	RequiredValidator,
	StringLengthValidator,
};
