import { v4 as uuid_v4 } from 'uuid';
import {
	FIELD_ALTERNATIVE_EMAIL,
	FIELD_DOMAIN,
	FIELD_FIRSTNAME,
	FIELD_IS_ADMIN,
	FIELD_LASTNAME,
	FIELD_MAILBOX,
	FIELD_NAME,
	FIELD_PASSWORD,
	FIELD_UUID,
} from 'calypso/my-sites/email/form/mailboxes/constants';
import type { TranslateResult } from 'i18n-calypso';

type FieldError = TranslateResult | null;

enum EmailProvider {
	Google = 'Google',
	Titan = 'Titan',
}

interface MailboxFormField< Type > {
	error: FieldError;
	isRequired: boolean;
	isVisible: boolean;
	readonly typeName: string;
	value: Type;
}

abstract class MailboxFormFieldBase< T > implements MailboxFormField< T > {
	private fieldError: FieldError = null;

	public get error() {
		return this.fieldError;
	}

	public set error( error: FieldError ) {
		if ( ! error || ( typeof error === 'string' && error.trim() === '' ) ) {
			error = null;
		}
		this.fieldError = error;
	}

	value!: T;
	isRequired;
	isVisible = true;
	fieldName: FormFieldNames;
	readonly typeName = String.name.toLowerCase();

	constructor( fieldName: FormFieldNames, isRequired = true ) {
		this.fieldName = fieldName;
		this.isRequired = isRequired;
	}

	hasError(): boolean {
		return Boolean( this.fieldError );
	}

	hasValidValue(): boolean {
		return Boolean( this.value );
	}
}

class DataMailboxFormField extends MailboxFormFieldBase< string > {
	isVisible = false;
	value = uuid_v4();
	readonly typeName = 'data';
}

class TextMailboxFormField extends MailboxFormFieldBase< string > {
	value = '';

	hasValidValue(): boolean {
		return super.hasValidValue() && this.value.trim() !== '';
	}
}

class BooleanMailboxFormField extends MailboxFormFieldBase< boolean > {
	value = false;
	readonly typeName = Boolean.name.toLowerCase();
}

interface IBaseMailboxFormFields {
	readonly domain: DataMailboxFormField;
	mailbox: TextMailboxFormField;
	password: TextMailboxFormField;
	readonly uuid: DataMailboxFormField;
}

interface IGoogleMailboxFormFields extends IBaseMailboxFormFields {
	firstName?: TextMailboxFormField;
	lastName?: TextMailboxFormField;
}

interface ITitanMailboxFormFields extends IBaseMailboxFormFields {
	alternativeEmail?: TextMailboxFormField;
	name?: TextMailboxFormField;
	isAdmin?: BooleanMailboxFormField;
}

abstract class MailboxFormFields implements IBaseMailboxFormFields {
	readonly domain = new DataMailboxFormField( FIELD_DOMAIN );
	mailbox = new TextMailboxFormField( FIELD_MAILBOX );
	password = new TextMailboxFormField( FIELD_PASSWORD );
	readonly uuid = new DataMailboxFormField( FIELD_UUID );

	constructor( domain: string ) {
		this.domain.value = domain;
	}
}

class GoogleMailboxFormFields extends MailboxFormFields implements IGoogleMailboxFormFields {
	firstName? = new TextMailboxFormField( FIELD_FIRSTNAME );
	lastName? = new TextMailboxFormField( FIELD_LASTNAME );
}

class TitanMailboxFormFields extends MailboxFormFields implements ITitanMailboxFormFields {
	alternativeEmail? = new TextMailboxFormField( FIELD_ALTERNATIVE_EMAIL );
	isAdmin? = new BooleanMailboxFormField( FIELD_IS_ADMIN, false );
	name? = new TextMailboxFormField( FIELD_NAME );
}

const MailboxFormFieldsMap = {
	[ EmailProvider.Google ]: GoogleMailboxFormFields,
	[ EmailProvider.Titan ]: TitanMailboxFormFields,
};

type GoogleFormFieldNames = keyof GoogleMailboxFormFields;
type TitanFormFieldNames = keyof TitanMailboxFormFields;
type FormFieldNames = GoogleFormFieldNames | TitanFormFieldNames;
type MutableFormFieldNames = Exclude< FormFieldNames, typeof FIELD_DOMAIN | typeof FIELD_UUID >;
type ValidatorFieldNames = FormFieldNames | null;

type ProviderKeys = keyof typeof MailboxFormFieldsMap;
type ProviderTypes = typeof MailboxFormFieldsMap[ ProviderKeys ];
type ExtractInstanceType< T > = T extends new ( domain: string ) => infer R ? R : never;

class MailboxFormFieldsFactory {
	static create( providerKey: ProviderKeys, domain: string ): ExtractInstanceType< ProviderTypes > {
		return new MailboxFormFieldsMap[ providerKey ]( domain );
	}
}

export type {
	FieldError,
	FormFieldNames,
	GoogleFormFieldNames,
	GoogleMailboxFormFields,
	MailboxFormFieldBase,
	MailboxFormFields,
	MutableFormFieldNames,
	TitanFormFieldNames,
	TitanMailboxFormFields,
	ValidatorFieldNames,
};

export { EmailProvider, MailboxFormFieldsFactory };
