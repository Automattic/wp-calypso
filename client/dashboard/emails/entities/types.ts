import { MailboxProvider } from '../types';
import {
	FIELD_DOMAIN,
	FIELD_FIRSTNAME,
	FIELD_LASTNAME,
	FIELD_MAILBOX,
	FIELD_PASSWORD,
	FIELD_PASSWORD_RESET_EMAIL,
	FIELD_UUID,
} from './constants';

// This type represents things that React can render, but which also exist. (E.g.
// not nullable, not undefined, etc.)
type ExistingReactNode = React.ReactElement | string | number;

// Translate hooks, like component interpolation or highlighting untranslated strings,
// force us to declare the return type as a generic React node, not as just string.
type TranslateResult = ExistingReactNode;

type FieldError = TranslateResult | null;

interface MailboxFormField< Type > {
	dispatchState: () => void;
	error: FieldError;
	isRequired: boolean;
	isTouched: boolean;
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
	isTouched = false;
	isVisible = true;
	fieldName: FormFieldNames;
	readonly typeName = String.name.toLowerCase();

	dispatchState = (): void => {
		return;
	};

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
	value = crypto.randomUUID() as string;
	readonly typeName = 'data';
}

export class TextMailboxFormField extends MailboxFormFieldBase< string > {
	value = '';

	hasValidValue(): boolean {
		return super.hasValidValue() && this.value.trim() !== '';
	}
}

interface IBaseMailboxFormFields {
	readonly domain: DataMailboxFormField;
	mailbox: TextMailboxFormField;
	password: TextMailboxFormField;
	passwordResetEmail?: TextMailboxFormField;
	readonly uuid: DataMailboxFormField;
}

interface IGoogleMailboxFormFields extends IBaseMailboxFormFields {
	firstName: TextMailboxFormField;
	lastName: TextMailboxFormField;
}

interface ITitanMailboxFormFields extends IBaseMailboxFormFields {}

abstract class MailboxFormFields implements IBaseMailboxFormFields {
	readonly domain = new DataMailboxFormField( FIELD_DOMAIN );
	mailbox = new TextMailboxFormField( FIELD_MAILBOX );
	password = new TextMailboxFormField( FIELD_PASSWORD );
	readonly uuid = new DataMailboxFormField( FIELD_UUID );
	passwordResetEmail? = new TextMailboxFormField( FIELD_PASSWORD_RESET_EMAIL );

	constructor( domain: string ) {
		this.domain.value = domain;
	}
}

class GoogleMailboxFormFields extends MailboxFormFields implements IGoogleMailboxFormFields {
	firstName = new TextMailboxFormField( FIELD_FIRSTNAME );
	lastName = new TextMailboxFormField( FIELD_LASTNAME );
}

class TitanMailboxFormFields extends MailboxFormFields implements ITitanMailboxFormFields {}

const MailboxFormFieldsMap: Record< MailboxProvider, new ( domain: string ) => MailboxFormFields > =
	{
		[ MailboxProvider.Google ]: GoogleMailboxFormFields,
		[ MailboxProvider.Titan ]: TitanMailboxFormFields,
	};

type GoogleFormFieldNames = keyof GoogleMailboxFormFields;
type TitanFormFieldNames = keyof TitanMailboxFormFields;
type FormFieldNames = GoogleFormFieldNames | TitanFormFieldNames;
type ValidatorFieldNames = FormFieldNames | null;

type ProviderKeys = keyof typeof MailboxFormFieldsMap;
type ProviderTypes = ( typeof MailboxFormFieldsMap )[ ProviderKeys ];
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

export { MailboxFormFieldsFactory };
