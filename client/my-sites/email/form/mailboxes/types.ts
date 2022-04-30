import { v4 as uuid_v4 } from 'uuid';
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
	error: FieldError = null;
	value!: T;
	isRequired;
	isVisible = true;
	readonly typeName = String.name.toLowerCase();

	constructor( isRequired = true ) {
		this.isRequired = isRequired;
	}
}

class DataMailboxFormField extends MailboxFormFieldBase< string > {
	value = uuid_v4();
}

class TextMailboxFormField extends MailboxFormFieldBase< string > {
	value = '';
}

class BooleanMailboxFormField extends MailboxFormFieldBase< boolean > {
	value = false;
	readonly typeName = Boolean.name.toLowerCase();
}

interface IBaseMailboxFormFields {
	readonly domain: TextMailboxFormField;
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
	readonly domain = new TextMailboxFormField();
	mailbox = new TextMailboxFormField();
	password = new TextMailboxFormField();
	readonly uuid = new DataMailboxFormField();

	constructor( domain: string ) {
		this.domain.value = domain;
	}
}

class GoogleMailboxFormFields extends MailboxFormFields implements IGoogleMailboxFormFields {
	firstName? = new TextMailboxFormField();
	lastName? = new TextMailboxFormField();
}

class TitanMailboxFormFields extends MailboxFormFields implements ITitanMailboxFormFields {
	alternativeEmail? = new TextMailboxFormField();
	isAdmin? = new BooleanMailboxFormField( false );
	name? = new TextMailboxFormField();
}

const MailboxFormFieldsMap = {
	[ EmailProvider.Google ]: GoogleMailboxFormFields,
	[ EmailProvider.Titan ]: TitanMailboxFormFields,
};

type GoogleFormFieldNames = keyof GoogleMailboxFormFields;
type TitanFormFieldNames = keyof TitanMailboxFormFields;
type FormFieldNames = GoogleFormFieldNames | TitanFormFieldNames;
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
	TitanFormFieldNames,
	TitanMailboxFormFields,
	ValidatorFieldNames,
};

export { EmailProvider, MailboxFormFieldsFactory };
