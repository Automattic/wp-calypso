import { EmailProvider } from '@automattic/api-core';
import { createInterpolateElement } from '@wordpress/element';
import { __, sprintf } from '@wordpress/i18n';
import emailValidator from 'email-validator';
import { createElement } from 'react';
import wp from 'calypso/lib/wp';
import type { FieldError, MailboxFormFieldBase } from './types';

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
		return __( 'This field is required.' );
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
		// Translators: %s is the maximum length in characters.
		return sprintf( __( "This field can't be longer than %s characters." ), maximumStringLength );
	}

	validateField( field: MailboxFormFieldBase< string > ): void {
		if ( this.maximumStringLength < ( field.value?.length ?? 0 ) ) {
			field.error = MaximumStringLengthValidator.getFieldTooLongError( this.maximumStringLength );
		}
	}
}

class MailboxNameValidator extends BaseValidator< string > {
	private readonly areApostrophesSupported: boolean;
	private readonly domainName: string;
	private readonly mailboxHasDomainError: boolean;

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
		return __( 'Please supply a valid email address.' );
	}

	static getUnsupportedCharacterError( supportsApostrophes: boolean ): FieldError {
		return supportsApostrophes
			? __( 'Only numbers, letters, dashes, underscores, apostrophes and periods are allowed.' )
			: __( 'Only numbers, letters, dashes, underscores, and periods are allowed.' );
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

class PasswordResetEmailValidator extends BaseValidator< string > {
	private readonly domainName: string;

	constructor( domainName: string ) {
		super();
		this.domainName = domainName;
	}

	static getInvalidEmailError(): FieldError {
		return __( 'Please supply a valid email address.' );
	}

	static getSameDomainError( domainName: string ): FieldError {
		return createInterpolateElement(
			sprintf(
				// Translators: %(domain)s is the domain name.
				__(
					'This email address must have a different domain than <strong>%(domain)s</strong>. Please use a different email address.'
				),
				{
					domain: domainName,
				}
			),
			{
				strong: createElement( 'strong' ),
			}
		);
	}

	validateField( field: MailboxFormFieldBase< string > ): void {
		if ( ! field.value || field.value.trim() === '' ) {
			return;
		}

		const value = `${ field.value }`;

		if ( ! emailValidator.validate( value ) ) {
			field.error = PasswordResetEmailValidator.getInvalidEmailError();

			return;
		}

		const parts = `${ value }`.split( '@' );

		if (
			this.domainName &&
			parts.length > 1 &&
			parts[ 1 ].toLowerCase() === this.domainName?.toLowerCase()
		) {
			field.error = PasswordResetEmailValidator.getSameDomainError( this.domainName );
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
		return sprintf(
			// Translators: %s is the minimum length in characters.
			__( "This field can't be shorter than %s characters." ),
			String( minimumPasswordLength )
		);
	}

	static getPasswordTooLongError(): FieldError {
		return sprintf(
			// Translators: %s is the maximum length in characters.
			__( "This field can't be longer than %s characters." ),
			PasswordValidator.maximumPasswordLength
		);
	}

	static getPasswordStartsWithSpaceError(): FieldError {
		return __( "This field can't start with a white space." );
	}

	static getPasswordEndsWithSpaceError(): FieldError {
		return __( "This field can't end with a white space." );
	}

	static getPasswordContainsForbiddenCharacterError(
		firstForbiddenCharacter: string | undefined
	): FieldError {
		// Translators: %s denotes a single character that is not allowed in this field
		return sprintf( __( "This field can't accept '%s' as character." ), firstForbiddenCharacter );
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
	private readonly existingMailboxNames: string[];
	protected readonly domainName: string;

	constructor( domainName: string, existingMailboxNames: string[] ) {
		super();
		this.domainName = domainName;
		this.existingMailboxNames = existingMailboxNames;
	}

	static getExistingMailboxError( domainName: string, existingMailboxName: string ): FieldError {
		return createInterpolateElement(
			sprintf(
				// Translators: %(emailAddress)s is the email address that already exists in the account.
				__(
					'Please use unique email addresses. <strong>%(emailAddress)s</strong> already exists in your account.'
				),
				{ emailAddress: `${ existingMailboxName }@${ domainName }` }
			),
			{ strong: createElement( 'strong' ) }
		);
	}

	getMailboxError( fieldValue: string ) {
		return ExistingMailboxNamesValidator.getExistingMailboxError( this.domainName, fieldValue );
	}

	validateField( field: MailboxFormFieldBase< string > ): void {
		if ( ! field.value || field.error ) {
			return;
		}

		const fieldValueLowerCased = field.value.trim().toLowerCase();

		this.existingMailboxNames.forEach( ( value ) => {
			const existingMailboxName = value.toLowerCase();

			if ( existingMailboxName !== fieldValueLowerCased ) {
				return;
			}

			field.error = this.getMailboxError( fieldValueLowerCased );
		} );
	}
}

class PreviouslySpecifiedMailboxNamesValidator extends ExistingMailboxNamesValidator {
	getMailboxError( fieldValue: string ) {
		return PreviouslySpecifiedMailboxNamesValidator.getExistingMailboxError(
			this.domainName,
			fieldValue
		);
	}

	static getExistingMailboxError( domainName: string, existingMailboxName: string ): FieldError {
		return createInterpolateElement(
			sprintf(
				// Translators: %(emailAddress)s is the email address that has already been specified in this form.
				__(
					'Please use unique email addresses. <strong>%(emailAddress)s</strong> has already been specified before.'
				),
				{ emailAddress: `${ existingMailboxName }@${ domainName }` }
			),
			{
				strong: createElement( 'strong' ),
			}
		);
	}
}

class MailboxNameAvailabilityValidator extends BaseValidator< string > {
	private readonly domainName: string;
	private readonly provider: EmailProvider;

	constructor( domainName: string, provider: EmailProvider ) {
		super();
		this.domainName = domainName;
		this.provider = provider;
	}

	static getUnavailableMailboxError( mailboxName: string, message: string ): FieldError {
		return createInterpolateElement(
			// Translators: %(mailbox)s is the local part of an email address. %(message)s is a translated message that gives context to why the mailbox is not available
			sprintf( __( '<strong>%(mailbox)s</strong> is not available: %(message)s' ), {
				mailbox: mailboxName,
				message,
			} ),
			{
				strong: createElement( 'strong' ),
			}
		);
	}

	async checkMailboxAvailability( domain: string, mailbox: string ) {
		try {
			const encDomain = encodeURIComponent( domain );
			const encMailbox = encodeURIComponent( mailbox );
			const response = await wp.req.get( {
				path: `/emails/titan/${ encDomain }/check-mailbox-availability/${ encMailbox }`,
				apiNamespace: 'wpcom/v2',
			} );
			return { message: response.message, status: 200 };
			// eslint-disable-next-line @typescript-eslint/no-explicit-any -- We don't have proper typing for this error response
		} catch ( error: any ) {
			return { message: error?.message, status: error?.statusCode };
		}
	}

	async validate( field?: MailboxFormFieldBase< string > ) {
		if ( ! field || field.hasError() ) {
			return;
		}

		await this.validateField( field );
	}

	async validateField( field: MailboxFormFieldBase< string > ) {
		// Google has no mailbox name validator at this time
		if ( this.provider === 'google_workspace' ) {
			return;
		}

		// There's nothing to validate if the field has no value
		if ( ! field.value ) {
			return;
		}

		// Check that this mailbox name is available against the domain
		const { message, status } = await this.checkMailboxAvailability( this.domainName, field.value );

		// If mailbox name is not available ...
		if ( status !== 200 ) {
			field.error = MailboxNameAvailabilityValidator.getUnavailableMailboxError(
				field.value,
				message
			);
		}
	}
}

export type { Validator };

export {
	PasswordResetEmailValidator,
	ExistingMailboxNamesValidator,
	MailboxNameValidator,
	MailboxNameAvailabilityValidator,
	PasswordValidator,
	PreviouslySpecifiedMailboxNamesValidator,
	RequiredValidator,
	RequiredIfVisibleValidator,
	MaximumStringLengthValidator,
};
