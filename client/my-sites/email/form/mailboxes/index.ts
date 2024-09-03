import { GSuiteProductUser, TitanProductUser } from '@automattic/shopping-cart';
import {
	FIELD_DOMAIN,
	FIELD_FIRSTNAME,
	FIELD_IS_ADMIN,
	FIELD_LASTNAME,
	FIELD_MAILBOX,
	FIELD_NAME,
	FIELD_PASSWORD,
	FIELD_PASSWORD_RESET_EMAIL,
	FIELD_UUID,
} from 'calypso/my-sites/email/form/mailboxes/constants';
import {
	EmailProvider,
	FieldError,
	MailboxFormFieldBase,
	MailboxFormFieldsFactory,
} from 'calypso/my-sites/email/form/mailboxes/types';
import {
	ExistingMailboxNamesValidator,
	MailboxNameAvailabilityValidator,
	MailboxNameValidator,
	MaximumStringLengthValidator,
	PasswordValidator,
	PasswordResetEmailValidator,
	PreviouslySpecifiedMailboxNamesValidator,
	RequiredIfVisibleValidator,
	RequiredValidator,
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

	private getFormField< T >( fieldName: FormFieldNames ): MailboxFormFieldBase< T > | undefined {
		return Reflect.get( this.formFields, fieldName );
	}

	private getValidators(): [ ValidatorFieldNames, Validator< unknown > ][] {
		const domainField = this.getFormField< string >( FIELD_DOMAIN );
		const domainName = domainField?.value ?? '';
		const mailboxHasDomainError = Boolean( domainField?.error );
		const minimumPasswordLength = this.provider === EmailProvider.Titan ? 10 : 12;
		const areApostrophesSupported = this.provider === EmailProvider.Google;

		return [
			[ FIELD_DOMAIN, new RequiredValidator< string >() ],
			[ FIELD_FIRSTNAME, new RequiredValidator< string >() ],
			[ FIELD_FIRSTNAME, new MaximumStringLengthValidator( 60 ) ],
			[ FIELD_LASTNAME, new RequiredValidator< string >() ],
			[ FIELD_LASTNAME, new MaximumStringLengthValidator( 60 ) ],
			[ FIELD_MAILBOX, new RequiredValidator< string >() ],
			[ FIELD_NAME, new RequiredIfVisibleValidator() ],
			[ FIELD_NAME, new MaximumStringLengthValidator( 60 ) ],
			[ FIELD_MAILBOX, new ExistingMailboxNamesValidator( domainName, this.existingMailboxNames ) ],
			[
				FIELD_MAILBOX,
				new MailboxNameValidator( domainName, mailboxHasDomainError, areApostrophesSupported ),
			],
			[ FIELD_PASSWORD, new RequiredValidator< string >() ],
			[ FIELD_PASSWORD, new PasswordValidator( minimumPasswordLength ) ],
			[ FIELD_PASSWORD_RESET_EMAIL, new RequiredValidator< string >() ],
			[ FIELD_PASSWORD_RESET_EMAIL, new PasswordResetEmailValidator( domainName ) ],
			[ FIELD_UUID, new RequiredValidator< string >() ],
		];
	}

	/**
	 * On demand validators may be async i.e. making network calls, or may require a set of conditions to be fulfilled
	 * @private
	 */
	private getOnDemandValidators(): Record< string, [ ValidatorFieldNames, Validator< unknown > ] > {
		const domainField = this.getFormField< string >( FIELD_DOMAIN );
		const domainName = domainField?.value ?? '';

		return {
			[ MailboxNameAvailabilityValidator.name ]: [
				FIELD_MAILBOX,
				new MailboxNameAvailabilityValidator( domainName, this.provider ),
			],
		};
	}

	getPreviouslySpecifiedMailboxNameValidators(
		previouslySpecifiedMailboxNames: string[]
	): [ ValidatorFieldNames, Validator< unknown > ][] {
		const domainField = this.getFormField< string >( FIELD_DOMAIN );
		const domainName = domainField?.value ?? '';

		return [
			[
				FIELD_MAILBOX,
				new PreviouslySpecifiedMailboxNamesValidator( domainName, previouslySpecifiedMailboxNames ),
			],
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

	/**
	 * Returns the mailbox field values in a shape that can be consumed by the shopping cart at checkout
	 */
	getAsCartItem(): TitanProductUser | GSuiteProductUser {
		const commonFields = {
			email: `${ this.getFieldValue< string >( FIELD_MAILBOX ) }@${ this.getFieldValue< string >(
				FIELD_DOMAIN
			) }`.toLowerCase(),
			password: this.getFieldValue< string >( FIELD_PASSWORD ),
		};

		return this.provider === EmailProvider.Google
			? {
					...commonFields,
					firstname: this.getFieldValue< string >( FIELD_FIRSTNAME ),
					lastname: this.getFieldValue< string >( FIELD_LASTNAME ),
					recoveryEmail: this.getFieldValue< string >( FIELD_PASSWORD_RESET_EMAIL ),
			  }
			: {
					...commonFields,
					alternative_email: this.getFieldValue< string >( FIELD_PASSWORD_RESET_EMAIL ),
					is_admin: this.getFieldValue< boolean >( FIELD_IS_ADMIN ),
					name: this.getFieldValue< string >( FIELD_NAME ),
			  };
	}

	getAsFlatObject(): Record< FormFieldNames, string | boolean | undefined > {
		return Object.fromEntries(
			Object.values( this.formFields ).map( ( field ) => [ field.fieldName, field.value ] )
		);
	}

	getFieldValue< R >( fieldName: FormFieldNames ) {
		return this.getFormField< R >( fieldName )?.value;
	}

	getFieldError( fieldName: FormFieldNames ): FieldError {
		return this.getFormField( fieldName )?.error ?? null;
	}

	getIsFieldRequired( fieldName: FormFieldNames ) {
		return this.getFormField( fieldName )?.isRequired;
	}

	getIsFieldTouched( fieldName: FormFieldNames ) {
		return this.getFormField( fieldName )?.isTouched;
	}

	getIsFieldVisible( fieldName: FormFieldNames ) {
		return this.getFormField( fieldName )?.isVisible;
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

	setFieldValue< R >( fieldName: FormFieldNames, value: R ) {
		const field = this.getFormField< R >( fieldName );
		if ( field ) {
			field.value = value;
		}
	}

	private validateFieldByName(
		fieldName: ValidatorFieldNames,
		validator: Validator< unknown >,
		skipInvisibleFields: boolean
	) {
		if ( ! fieldName ) {
			return;
		}

		const field = this.getFormField( fieldName );
		if ( ! field || field.error ) {
			return;
		}

		if ( skipInvisibleFields && ! field.isVisible ) {
			return;
		}

		validator.validate( field );
	}

	validate(
		skipInvisibleFields = false,
		additionalValidators?: [ ValidatorFieldNames, Validator< unknown > ][]
	) {
		this.clearErrors();

		[ ...this.getValidators(), ...( additionalValidators ?? [] ) ].forEach(
			( [ fieldName, validator ] ) =>
				this.validateFieldByName( fieldName, validator, skipInvisibleFields )
		);
	}

	async validateField( fieldName: FormFieldNames ) {
		const field = this.getFormField( fieldName );
		if ( ! field ) {
			return;
		}

		// Clear previous error
		field.error = null;

		// Validate single field by name
		const validators = this.getValidators()
			.filter( ( [ currentFieldName ] ) => currentFieldName === fieldName )
			.map( ( [ , validator ] ) => validator );

		const promises = Promise.all( validators.map( ( validator ) => validator.validate( field ) ) );

		await promises;
	}

	async validateOnDemand() {
		this.clearErrors();

		const promises = Promise.all(
			Object.values( this.getOnDemandValidators() )
				.filter(
					( [ fieldName, validator ] ) => fieldName && this.getFormField( fieldName ) && validator
				)
				.map( ( [ fieldName, validator ] ) =>
					validator.validate( this.getFormField( fieldName as FormFieldNames ) )
				)
		);

		await promises;
	}
}

export { MailboxForm };
