import emailValidator from 'email-validator';
import i18n from 'i18n-calypso';
import React from 'react';
import type { FieldError, MailboxFormFieldBase } from 'calypso/my-sites/email/form/mailboxes/types';

interface Validator< T > {
	validate( field?: MailboxFormFieldBase< T > ): void;
}

abstract class BaseValidator< T > implements Validator< T > {
	validate( field?: MailboxFormFieldBase< T > ): void {
		if ( ! field || field.hasError() ) {
			return;
		}

		this.validateField( field );
	}

	abstract validateField( field: MailboxFormFieldBase< T > ): void;
}

class RequiredValidator< T > extends BaseValidator< T > {
	static getRequiredFieldError(): FieldError {
		return i18n.translate( 'This field is required.' );
	}

	validateField( field: MailboxFormFieldBase< T > ): void {
		if ( ! field.isRequired ) {
			return;
		}

		const requiredFieldError = RequiredValidator.getRequiredFieldError();

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
	validateField( field: MailboxFormFieldBase< string > ): void {
		if ( ! field.isVisible ) {
			return;
		}

		super.validateField( field );
	}
}

class MaximumStringLengthValidator extends BaseValidator< string > {
	private readonly maximumStringLength: number;

	constructor( maximumStringLength: number ) {
		super();
		this.maximumStringLength = maximumStringLength;
	}

	static getFieldTooLongError( maximumStringLength: number ): FieldError {
		return i18n.translate( "This field can't be longer than %s characters.", {
			args: maximumStringLength,
		} );
	}

	validateField( field: MailboxFormFieldBase< string > ): void {
		if ( this.maximumStringLength < ( field.value?.length ?? 0 ) ) {
			field.error = MaximumStringLengthValidator.getFieldTooLongError( this.maximumStringLength );
		}
	}
}

class MailboxNameValidator extends BaseValidator< string > {
	areApostrophesSupported: boolean;
	domainName: string;
	mailboxHasDomainError: boolean;

	constructor(
		domainName: string,
		mailboxHasDomainError: boolean,
		areApostrophesSupported: boolean
	) {
		super();
		this.domainName = domainName;
		this.mailboxHasDomainError = mailboxHasDomainError;
		this.areApostrophesSupported = areApostrophesSupported;
	}

	static getInvalidEmailError(): FieldError {
		return i18n.translate( 'Please supply a valid email address.' );
	}

	static getUnsupportedCharacterError( supportsApostrophes: boolean ): FieldError {
		return supportsApostrophes
			? i18n.translate(
					'Only numbers, letters, dashes, underscores, apostrophes and periods are allowed.'
			  )
			: i18n.translate( 'Only numbers, letters, dashes, underscores, and periods are allowed.' );
	}

	validateField( field: MailboxFormFieldBase< string > ): void {
		const regex = this.areApostrophesSupported
			? /^[\da-z_'-](\.?[\da-z_'-])*$/i
			: /^[\da-z_-](\.?[\da-z_-])*$/i;

		if ( ! regex.test( field.value ) ) {
			field.error = MailboxNameValidator.getUnsupportedCharacterError(
				this.areApostrophesSupported
			);
			return;
		}

		if (
			this.domainName &&
			! this.mailboxHasDomainError &&
			! emailValidator.validate( `${ field.value }@${ this.domainName }` )
		) {
			field.error = MailboxNameValidator.getInvalidEmailError();
			return;
		}
	}
}

class AlternateEmailValidator extends BaseValidator< string > {
	domainName: string;

	constructor( domainName: string ) {
		super();
		this.domainName = domainName;
	}

	static getInvalidEmailError(): FieldError {
		return i18n.translate( 'Please supply a valid email address.' );
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

	validateField( field: MailboxFormFieldBase< string > ): void {
		if ( ! field.value || field.value.trim() === '' ) {
			return;
		}

		const value = `${ field.value }`;

		if ( ! emailValidator.validate( value ) ) {
			field.error = AlternateEmailValidator.getInvalidEmailError();

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

class PasswordValidator extends BaseValidator< string > {
	private readonly minimumPasswordLength: number;
	static readonly maximumPasswordLength = 100;

	constructor( minimumPasswordLength: number ) {
		super();
		this.minimumPasswordLength = minimumPasswordLength;
	}

	static getPasswordTooShortError( minimumPasswordLength: number ): FieldError {
		return i18n.translate( "This field can't be shorter than %s characters.", {
			args: String( minimumPasswordLength ),
		} );
	}

	static getPasswordTooLongError(): FieldError {
		return i18n.translate( "This field can't be longer than %s characters.", {
			args: PasswordValidator.maximumPasswordLength,
		} );
	}

	static getPasswordStartsWithSpaceError(): FieldError {
		return i18n.translate( "This field can't start with a white space." );
	}

	static getPasswordEndsWithSpaceError(): FieldError {
		return i18n.translate( "This field can't end with a white space." );
	}

	static getPasswordContainsForbiddenCharacterError(
		firstForbiddenCharacter: string | undefined
	): FieldError {
		return i18n.translate( "This field can't accept '%s' as character.", {
			args: firstForbiddenCharacter,
			comment: '%s denotes a single character that is not allowed in this field',
		} );
	}

	validateField( field: MailboxFormFieldBase< string > ): void {
		const value = field.value;

		if ( this.minimumPasswordLength > value.length ) {
			field.error = PasswordValidator.getPasswordTooShortError( this.minimumPasswordLength );
			return;
		}

		if ( PasswordValidator.maximumPasswordLength < value.length ) {
			field.error = PasswordValidator.getPasswordTooLongError();
			return;
		}

		if ( value.startsWith( ' ' ) ) {
			field.error = PasswordValidator.getPasswordStartsWithSpaceError();
			return;
		}

		// Checks that passwords only have ASCII characters (see https://en.wikipedia.org/wiki/ASCII#Character_set)
		const regexp = /[^\x20-\x7E]/;

		if ( regexp.test( value ) ) {
			const firstForbiddenCharacter = [ ...value ].find( ( character ) =>
				regexp.test( character )
			);

			field.error =
				PasswordValidator.getPasswordContainsForbiddenCharacterError( firstForbiddenCharacter );
			return;
		}

		if ( value.endsWith( ' ' ) ) {
			field.error = PasswordValidator.getPasswordEndsWithSpaceError();
		}
	}
}

class ExistingMailboxNamesValidator extends BaseValidator< string > {
	existingMailboxNames: string[];

	constructor( existingMailboxNames: string[] ) {
		super();
		this.existingMailboxNames = existingMailboxNames;
	}

	static getExistingMailboxError(): FieldError {
		return i18n.translate( 'Please use unique mailboxes.' );
	}

	validateField( field: MailboxFormFieldBase< string > ): void {
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
