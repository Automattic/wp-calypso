import {
	FIELD_ALTERNATIVE_EMAIL,
	FIELD_DOMAIN,
	FIELD_FIRSTNAME,
	FIELD_LASTNAME,
	FIELD_MAILBOX,
	FIELD_NAME,
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
	ExistingMailboxNamesValidator,
	MailboxNameValidator,
	PasswordValidator,
	RequiredValidator,
	RequiredIfVisibleValidator,
	MaximumStringLengthValidator,
} from 'calypso/my-sites/email/form/mailboxes/validators';
import type {
	FormFieldNames,
	MailboxFormFields,
	ValidatorFieldNames,
} from 'calypso/my-sites/email/form/mailboxes/types';
import type { Validator } from 'calypso/my-sites/email/form/mailboxes/validators';

class MailboxForm< T extends EmailProvider > {
	existingMailboxNames: string[];
	formFields: MailboxFormFields;
	provider: T;

	constructor( provider: T, domain: string, existingMailboxNames: string[] = [] ) {
		this.existingMailboxNames = existingMailboxNames;
		this.formFields = MailboxFormFieldsFactory.create( provider, domain );
		this.provider = provider;
	}

	private getFormField< T >( fieldName: FormFieldNames ): MailboxFormFieldBase< T > | null {
		if ( fieldName in this.formFields ) {
			const field = Reflect.get( this.formFields, fieldName );
			if ( field ) {
				return field;
			}
		}

		return null;
	}

	private getValidators(): [ ValidatorFieldNames, Validator< unknown > ][] {
		const domainField = this.getFormField< string >( FIELD_DOMAIN );
		const domainName = domainField?.value ?? '';
		const mailboxHasDomainError = Boolean( domainField?.error );
		const minimumPasswordLength = this.provider === EmailProvider.Titan ? 10 : 12;
		const areApostrophesSupported = this.provider === EmailProvider.Google;

		return [
			[ FIELD_ALTERNATIVE_EMAIL, new RequiredValidator< string >() ],
			[ FIELD_ALTERNATIVE_EMAIL, new AlternateEmailValidator( domainName ) ],
			[ FIELD_DOMAIN, new RequiredValidator< string >() ],
			[ FIELD_FIRSTNAME, new RequiredValidator< string >() ],
			[ FIELD_FIRSTNAME, new MaximumStringLengthValidator( 60 ) ],
			[ FIELD_LASTNAME, new RequiredValidator< string >() ],
			[ FIELD_LASTNAME, new MaximumStringLengthValidator( 60 ) ],
			[ FIELD_MAILBOX, new RequiredValidator< string >() ],
			[ FIELD_NAME, new RequiredIfVisibleValidator() ],
			[ FIELD_NAME, new MaximumStringLengthValidator( 60 ) ],
			[ FIELD_MAILBOX, new ExistingMailboxNamesValidator( this.existingMailboxNames ) ],
			[
				FIELD_MAILBOX,
				new MailboxNameValidator( domainName, mailboxHasDomainError, areApostrophesSupported ),
			],
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
		return Object.values( this.formFields ).some( ( field ) => field.hasError() );
	}

	hasValidValues() {
		return Object.values( this.formFields as MailboxFormFields )
			.filter( ( field ) => field.isRequired ?? false )
			.every( ( field ) => field.hasValidValue() );
	}

	isValid() {
		return ! this.hasErrors() && this.hasValidValues();
	}

	setFieldIsVisible( fieldName: FormFieldNames, isVisible: boolean ) {
		const field = this.getFormField( fieldName );
		if ( field ) {
			field.isVisible = isVisible;
		}
	}

	setFieldIsRequired( fieldName: FormFieldNames, isRequired: boolean ) {
		const field = this.getFormField( fieldName );
		if ( field ) {
			field.isRequired = isRequired;
		}
	}

	validate() {
		this.clearErrors();

		for ( const [ fieldName, validator ] of this.getValidators() ) {
			if ( ! fieldName ) {
				continue;
			}

			const field = this.getFormField( fieldName );
			if ( ! field || field.error ) {
				continue;
			}

			validator.validate( field );
		}
	}
}

export { MailboxForm };
