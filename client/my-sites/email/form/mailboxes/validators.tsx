import emailValidator from 'email-validator';
import i18n from 'i18n-calypso';
import { createElement } from 'react';
import wp from 'calypso/lib/wp';
import { EmailProvider } from 'calypso/my-sites/email/form/mailboxes/types';
import type {
	FieldError,
	SingleFieldError,
	MailboxFormFieldBase,
} from 'calypso/my-sites/email/form/mailboxes/types';

interface Validator< T > {
	validate( field?: MailboxFormFieldBase< T > ): Promise< void >;
}

abstract class BaseValidator< T > implements Validator< T > {
	async validate( field?: MailboxFormFieldBase< T > ): Promise< void > {
		if ( ! field || field.hasError() ) {
			return;
		}

		await this.validateField( field );
	}

	abstract validateField( field: MailboxFormFieldBase< T > ): Promise< void >;
}

class RequiredValidator< T > extends BaseValidator< T > {
	static getRequiredFieldError(): FieldError {
		return i18n.translate( 'This field is required.' );
	}

	async validateField( field: MailboxFormFieldBase< T > ): Promise< void > {
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
	async validateField( field: MailboxFormFieldBase< string > ): Promise< void > {
		if ( ! field.isVisible ) {
			return;
		}

		await super.validateField( field );
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

	async validateField( field: MailboxFormFieldBase< string > ): Promise< void > {
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

	static getInvalidEmailError(): SingleFieldError {
		return i18n.translate( 'Please supply a valid email address.' );
	}

	static getUnsupportedCharacterError( supportsApostrophes: boolean ): SingleFieldError {
		return supportsApostrophes
			? i18n.translate(
					'Only numbers, letters, dashes, underscores, apostrophes and periods are allowed.'
			  )
			: i18n.translate( 'Only numbers, letters, dashes, underscores, and periods are allowed.' );
	}

	async validateField( field: MailboxFormFieldBase< string > ): Promise< void > {
		const value = field.value;
		const validationErrors: FieldError = [];

		const regex = this.areApostrophesSupported
			? /^[\da-z_'-](\.?[\da-z_'-])*$/i
			: /^[\da-z_-](\.?[\da-z_-])*$/i;

		if ( ! regex.test( value ) ) {
			validationErrors.push(
				MailboxNameValidator.getUnsupportedCharacterError( this.areApostrophesSupported )
			);
		}

		if (
			this.domainName &&
			! this.mailboxHasDomainError &&
			! emailValidator.validate( `${ value }@${ this.domainName }` )
		) {
			validationErrors.push( MailboxNameValidator.getInvalidEmailError() );
		}

		field.error =
			validationErrors.length === 0
				? null
				: validationErrors.map( ( error, index ) => <div key={ index }>{ error }</div> );
	}
}

class PasswordResetEmailValidator extends BaseValidator< string > {
	private readonly domainName: string;

	constructor( domainName: string ) {
		super();
		this.domainName = domainName;
	}

	static getInvalidEmailError(): SingleFieldError {
		return i18n.translate( 'Please supply a valid email address.' );
	}

	static getSameDomainError( domainName: string ): SingleFieldError {
		return i18n.translate(
			'This email address must have a different domain than {{strong}}%(domain)s{{/strong}}. Please use a different email address.',
			{
				args: {
					domain: domainName,
				},
				components: {
					strong: createElement( 'strong' ),
				},
			}
		);
	}

	async validateField( field: MailboxFormFieldBase< string > ): Promise< void > {
		if ( ! field.value || field.value.trim() === '' ) {
			return;
		}

		const value = field.value;
		const validationErrors: FieldError = [];

		if ( ! emailValidator.validate( value ) ) {
			validationErrors.push( PasswordResetEmailValidator.getInvalidEmailError() );
		}

		const parts = value.split( '@' );
		if (
			this.domainName &&
			parts.length > 1 &&
			parts[ 1 ].toLowerCase() === this.domainName?.toLowerCase()
		) {
			validationErrors.push( PasswordResetEmailValidator.getSameDomainError( this.domainName ) );
		}

		field.error =
			validationErrors.length === 0
				? null
				: validationErrors.map( ( error, index ) => <div key={ index }>{ error }</div> );
	}
}

class PasswordValidator extends BaseValidator< string > {
	private readonly minimumPasswordLength: number;
	private readonly domain: string;
	private readonly mailboxName?: string;
	static readonly maximumPasswordLength = 100;

	constructor( minimumPasswordLength: number, domain: string, mailboxName?: string ) {
		super();
		this.minimumPasswordLength = minimumPasswordLength;
		this.domain = domain;
		this.mailboxName = mailboxName;
	}

	static getPasswordTooShortError( minimumPasswordLength: number ): SingleFieldError {
		return i18n.translate( "This field can't be shorter than %s characters.", {
			args: String( minimumPasswordLength ),
		} );
	}

	static getPasswordTooLongError(): SingleFieldError {
		return i18n.translate( "This field can't be longer than %s characters.", {
			args: PasswordValidator.maximumPasswordLength,
		} );
	}

	static getPasswordStartsWithSpaceError(): SingleFieldError {
		return i18n.translate( "This field can't start with a white space." );
	}

	static getPasswordEndsWithSpaceError(): SingleFieldError {
		return i18n.translate( "This field can't end with a white space." );
	}

	static getPasswordContainsForbiddenCharacterError(
		firstForbiddenCharacter: string | undefined
	): SingleFieldError {
		return i18n.translate( "This field can't accept '%s' as character.", {
			args: firstForbiddenCharacter,
			comment: '%s denotes a single character that is not allowed in this field',
		} );
	}

	static getPasswordContainsDomainError( domain: string ): SingleFieldError {
		return i18n.translate( "Your password can't contain your domain name (%s).", {
			args: domain,
			comment: '%s denotes the domain name that is email address is being created for',
		} );
	}

	static getPasswordContainsMailboxNameError( mailboxName: string ): SingleFieldError {
		return i18n.translate( "Your password can't contain your email address name (%s).", {
			args: mailboxName,
			comment: '%s denotes the name being used for the email address the user is creating',
		} );
	}

	static getValidationApiErrors( errors: FieldError ): FieldError {
		return errors;
	}

	async validateField( field: MailboxFormFieldBase< string > ): Promise< void > {
		const value = field.value;
		const validationErrors: FieldError = [];

		if ( this.minimumPasswordLength > value.length ) {
			validationErrors.push(
				PasswordValidator.getPasswordTooShortError( this.minimumPasswordLength )
			);
		}

		if ( PasswordValidator.maximumPasswordLength < value.length ) {
			validationErrors.push( PasswordValidator.getPasswordTooLongError() );
		}

		if ( value.startsWith( ' ' ) ) {
			validationErrors.push( PasswordValidator.getPasswordStartsWithSpaceError() );
		}

		// Checks that passwords only have ASCII characters (see https://en.wikipedia.org/wiki/ASCII#Character_set)
		const regexp = /[^\x20-\x7E]/;

		if ( regexp.test( value ) ) {
			const firstForbiddenCharacter = [ ...value ].find( ( character ) =>
				regexp.test( character )
			);

			validationErrors.push(
				PasswordValidator.getPasswordContainsForbiddenCharacterError( firstForbiddenCharacter )
			);
		}

		if ( value.endsWith( ' ' ) ) {
			validationErrors.push( PasswordValidator.getPasswordEndsWithSpaceError() );
		}

		const domainParts = `${ this.domain }`.split( '.' );

		if ( value.toLowerCase().includes( domainParts[ 0 ].toLowerCase() ) ) {
			validationErrors.push( PasswordValidator.getPasswordContainsDomainError( domainParts[ 0 ] ) );
		}

		if ( this.mailboxName && value.toLowerCase().includes( this.mailboxName.toLowerCase() ) ) {
			validationErrors.push(
				PasswordValidator.getPasswordContainsMailboxNameError( this.mailboxName )
			);
		}

		try {
			const apiResponse = await this.mockApiCall( value );
			if ( ! apiResponse.success && apiResponse.errors ) {
				// NTS: This is sufficient if we want to display the exact error we get from the back end. If we want to customize or need to translate, we should implement a `getValidationApiError` method.
				validationErrors.push( ...apiResponse.errors );
			}
		} catch ( error ) {
			field.error = PasswordValidator.getApiCallError();
			return;
		}

		field.error =
			validationErrors.length === 0
				? null
				: validationErrors.map( ( error, index ) => (
						<>
							<div key={ index }>{ error }</div>
						</>
				  ) );
	}

	private async mockApiCall(
		password: string
	): Promise< { success: boolean; errors?: SingleFieldError[] } > {
		return new Promise( ( resolve, reject ) => {
			setTimeout( () => {
				try {
					if ( password === 'password123' || password === 'short' ) {
						resolve( {
							success: false,
							errors: [ i18n.translate( 'This password is too common.' ) ],
						} );
					} else if ( password === 'multierrors' ) {
						resolve( {
							success: false,
							errors: [
								i18n.translate( 'This password is too common.' ),
								i18n.translate( 'This password has angered the entropy gods' ),
								i18n.translate( "No real error, I just don't like you." ),
							],
						} );
					} else if ( password === 'testerror' ) {
						reject( new Error( 'Simulated API error' ) );
					} else {
						resolve( { success: true } );
					}
				} catch ( error ) {
					reject( error );
				}
			}, 500 );
		} );
	}

	static getApiCallError(): FieldError {
		return i18n.translate( 'An error occurred while validating the password. Please try again.' );
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
		return i18n.translate(
			'Please use unique email addresses. {{strong}}%(emailAddress)s{{/strong}} already exists in your account.',
			{
				args: { emailAddress: `${ existingMailboxName }@${ domainName }` },
				components: { strong: createElement( 'strong' ) },
			}
		);
	}

	getMailboxError( fieldValue: string ) {
		return ExistingMailboxNamesValidator.getExistingMailboxError( this.domainName, fieldValue );
	}

	async validateField( field: MailboxFormFieldBase< string > ): Promise< void > {
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
		return i18n.translate(
			'Please use unique email addresses. {{strong}}%(emailAddress)s{{/strong}} has already been specified before.',
			{
				args: { emailAddress: `${ existingMailboxName }@${ domainName }` },
				components: { strong: createElement( 'strong' ) },
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
		return i18n.translate( '{{strong}}%(mailbox)s{{/strong}} is not available: %(message)s', {
			comment:
				'%(mailbox)s is the local part of an email address. %(message)s is a translated message that gives context to why the mailbox is not available',
			args: {
				mailbox: mailboxName,
				message,
			},
			components: {
				strong: createElement( 'strong' ),
			},
		} );
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
		if ( this.provider === EmailProvider.Google ) {
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
