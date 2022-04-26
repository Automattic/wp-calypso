import {
	FIELD_ALTERNATIVE_EMAIL,
	FIELD_DOMAIN,
	FIELD_FIRSTNAME,
	FIELD_LASTNAME,
	FIELD_MAILBOX,
	FIELD_PASSWORD,
	FIELD_UUID,
} from 'calypso/my-sites/email/form/mailboxes/constants';
import {
	EmailProvider,
	MailboxFormFieldsFactory,
} from 'calypso/my-sites/email/form/mailboxes/types';
import {
	AlternateEmailValidator,
	ExistingMailboxesValidator,
	MailboxNameValidator,
	PasswordValidator,
	RequiredValidator,
} from 'calypso/my-sites/email/form/mailboxes/validators';
import type {
	ValidatorFieldNames,
	MailboxFormFields,
} from 'calypso/my-sites/email/form/mailboxes/types';
import type { Validator } from 'calypso/my-sites/email/form/mailboxes/validators';

class MailboxForm< T extends EmailProvider > {
	existingMailboxes: string[];
	formFields: MailboxFormFields;
	provider: T;
	validators: [ ValidatorFieldNames, Validator< unknown > ][] = [
		[ FIELD_ALTERNATIVE_EMAIL, new AlternateEmailValidator< T >( this ) ],
		[ FIELD_DOMAIN, new RequiredValidator< string >() ],
		[ FIELD_FIRSTNAME, new RequiredValidator< string >() ],
		[ FIELD_LASTNAME, new RequiredValidator< string >() ],
		[ FIELD_MAILBOX, new RequiredValidator< string >() ],
		[ FIELD_MAILBOX, new ExistingMailboxesValidator( this ) ],
		[ FIELD_MAILBOX, new MailboxNameValidator< T >( this ) ],
		[ FIELD_PASSWORD, new RequiredValidator< string >() ],
		[ FIELD_PASSWORD, new PasswordValidator() ],
		[ FIELD_UUID, new RequiredValidator< string >() ],
	];

	constructor( provider: T, domain: string, existingMailboxes: string[] = [] ) {
		this.existingMailboxes = existingMailboxes;
		this.formFields = MailboxFormFieldsFactory.create( provider, domain );
		this.provider = provider;
	}

	clearErrors() {
		for ( const field of Object.values( this.formFields ) ) {
			if ( ! field ) {
				return;
			}

			field.error = null;
		}
	}

	hasErrors() {
		return Object.values( this.formFields ).some( ( field ) => field.error !== null );
	}

	hasValidValues() {
		return Object.values( this.formFields as MailboxFormFields )
			.filter( ( field ) => field.required ?? false )
			.some(
				( field ) =>
					field.typeName === Boolean.name.toLowerCase() || `${ field.value }`.trim() !== ''
			);
	}

	isValid() {
		return ! this.hasErrors() && this.hasValidValues();
	}

	validate() {
		this.clearErrors();

		for ( const [ fieldName, validator ] of this.validators ) {
			if ( ! fieldName ) {
				continue;
			}

			const field = Reflect.get( this.formFields, fieldName );
			if ( ! field || field.error ) {
				continue;
			}

			validator.validate( field );
		}
	}
}

export { MailboxForm };
