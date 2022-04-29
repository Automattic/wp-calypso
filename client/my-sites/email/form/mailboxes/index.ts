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
	MailboxFormFieldBase,
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
	FormFieldNames,
	MailboxFormFields,
	ValidatorFieldNames,
} from 'calypso/my-sites/email/form/mailboxes/types';
import type { Validator } from 'calypso/my-sites/email/form/mailboxes/validators';

class MailboxForm< T extends EmailProvider > {
	existingMailboxes: string[];
	formFields: MailboxFormFields;
	provider: T;

	constructor( provider: T, domain: string, existingMailboxes: string[] = [] ) {
		this.existingMailboxes = existingMailboxes;
		this.formFields = MailboxFormFieldsFactory.create( provider, domain );
		this.provider = provider;
	}

	#getFormField< T >( fieldName: FormFieldNames ): MailboxFormFieldBase< T > | null {
		if ( fieldName in this.formFields ) {
			const field = Reflect.get( this.formFields, fieldName );
			if ( field ) {
				return field;
			}
		}

		return null;
	}

	#getValidators(): [ ValidatorFieldNames, Validator< unknown > ][] {
		const minimumPasswordLength = this.provider === EmailProvider.Titan ? 10 : 12;

		return [
			[ FIELD_ALTERNATIVE_EMAIL, new AlternateEmailValidator< T >( this ) ],
			[ FIELD_DOMAIN, new RequiredValidator< string >() ],
			[ FIELD_FIRSTNAME, new RequiredValidator< string >() ],
			[ FIELD_LASTNAME, new RequiredValidator< string >() ],
			[ FIELD_MAILBOX, new RequiredValidator< string >() ],
			[ FIELD_MAILBOX, new ExistingMailboxesValidator( this.existingMailboxes ) ],
			[ FIELD_MAILBOX, new MailboxNameValidator< T >( this ) ],
			[ FIELD_PASSWORD, new RequiredValidator< string >() ],
			[ FIELD_PASSWORD, new PasswordValidator( minimumPasswordLength ) ],
			[ FIELD_UUID, new RequiredValidator< string >() ],
		];
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
			.every(
				( field ) =>
					field.typeName === Boolean.name.toLowerCase() || `${ field.value }`.trim() !== ''
			);
	}

	isValid() {
		return ! this.hasErrors() && this.hasValidValues();
	}

	setFieldIsVisible( fieldName: FormFieldNames, isVisible: boolean ) {
		const field = this.#getFormField( fieldName );
		if ( field ) {
			field.isVisible = isVisible;
		}
	}

	setFieldIsRequired( fieldName: FormFieldNames, isRequired: boolean ) {
		const field = this.#getFormField( fieldName );
		if ( field ) {
			field.isRequired = isRequired;
		}
	}

	validate() {
		this.clearErrors();

		for ( const [ fieldName, validator ] of this.#getValidators() ) {
			if ( ! fieldName ) {
				continue;
			}

			const field = this.#getFormField( fieldName );
			if ( ! field || field.error ) {
				continue;
			}

			validator.validate( field );
		}
	}
}

export { MailboxForm };
