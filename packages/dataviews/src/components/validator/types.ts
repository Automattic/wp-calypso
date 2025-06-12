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

export type Rules = {
	[ key in keyof typeof INPUT_VALIDATION_RULES ]: Rule;
};

export type Rule = {
	message: string;
	value: boolean | number;
};

export type NormalizedRule = {
	type: keyof typeof INPUT_VALIDATION_RULES;
	message: string;
	callback: ( value: any ) => string | undefined;
};
