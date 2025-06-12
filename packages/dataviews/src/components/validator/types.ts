import { Field, NormalizedField } from '../../types';
import { INPUT_VALIDATION_RULES } from './constant';

export type FormValidationState = {
	touchedFields: string[];
	errorMessages: Record< string, Record< string, string | undefined > >;
	setTouchedFields: ( touchedFields: string[] ) => void;
	setErrors: (
		field: string,
		error: Record< string, string | undefined >
	) => void;
	removeError: ( field: string ) => void;
	isFormValid: () => boolean;
};

export type Rules< Item > = {
	[ key in keyof typeof INPUT_VALIDATION_RULES ]?: Rule< Item >;
};

export type LengthRule = {
	message: string;
	value: number;
};

export type PatternRule = {
	message: string;
	value: string;
};

export type ValidateRule< Item > = {
	callback: (
		value: any,
		field: NormalizedField< Item >,
		data: Item
	) => string;
};

export type RequiredRule = {
	message: string;
	value: boolean;
};

export type Rule< Item > =
	| LengthRule
	| PatternRule
	| ValidateRule< Item >
	| RequiredRule;

export type NormalizedRule< Item > = {
	type: keyof typeof INPUT_VALIDATION_RULES;
	message: string;
	callback: (
		value: any,
		field?: NormalizedField< Item >,
		item?: Item
	) => string | undefined;
};
