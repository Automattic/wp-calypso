import { v4 as uuid_v4 } from 'uuid';
import type { TranslateResult } from 'i18n-calypso';

type FieldError = TranslateResult | null;

enum EmailProvider {
	Google = 'Google',
	Titan = 'Titan',
}

interface MailboxFormField< Type > {
	error: FieldError;
	value: Type;
}

abstract class MailboxFormFieldBase< T > implements MailboxFormField< T > {
	error: FieldError = null;
	value!: T;
}

class DataMailboxFormField extends MailboxFormFieldBase< string > {
	value = uuid_v4();
}

class TextMailboxFormField extends MailboxFormFieldBase< string | null > {
	value = null;
}

class BooleanMailboxFormField extends MailboxFormFieldBase< boolean > {
	value = false;
}

interface IBaseMailboxFormFields {
	domain: TextMailboxFormField;
	mailbox: TextMailboxFormField;
	password: TextMailboxFormField;
	readonly uuid: DataMailboxFormField;
}

interface IGoogleMailboxFormFields extends IBaseMailboxFormFields {
	firstName: TextMailboxFormField;
	lastName: TextMailboxFormField;
}

interface ITitanMailboxFormFields extends IBaseMailboxFormFields {
	alternativeEmail: TextMailboxFormField;
	name: TextMailboxFormField;
	isAdmin: BooleanMailboxFormField;
}

abstract class MailboxFormFields implements IBaseMailboxFormFields {
	domain = new TextMailboxFormField();
	mailbox = new TextMailboxFormField();
	password = new TextMailboxFormField();
	readonly uuid = new DataMailboxFormField();
}

class GoogleMailboxFormFields extends MailboxFormFields implements IGoogleMailboxFormFields {
	firstName = new TextMailboxFormField();
	lastName = new TextMailboxFormField();
}

class TitanMailboxFormFields extends MailboxFormFields implements ITitanMailboxFormFields {
	alternativeEmail = new TextMailboxFormField();
	isAdmin = new BooleanMailboxFormField();
	name = new TextMailboxFormField();
}

const MailboxFormFieldsMap = {
	[ EmailProvider.Google ]: GoogleMailboxFormFields,
	[ EmailProvider.Titan ]: TitanMailboxFormFields,
};

type ValidatorFieldNames = keyof GoogleMailboxFormFields | keyof TitanMailboxFormFields | null;

type ProviderKeys = keyof typeof MailboxFormFieldsMap;
type ProviderTypes = typeof MailboxFormFieldsMap[ ProviderKeys ];
type ExtractInstanceType< T > = T extends new () => infer R ? R : never;

class MailboxFormFieldsFactory {
	static create( providerKey: ProviderKeys ): ExtractInstanceType< ProviderTypes > {
		return new MailboxFormFieldsMap[ providerKey ]();
	}
}

export type { ValidatorFieldNames, MailboxFormFieldBase, MailboxFormFields };

export { EmailProvider, MailboxFormFieldsFactory };
