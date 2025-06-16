import { Field, ValidationContext } from '../../types';
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
	isFormValid: boolean;
};

export type RequiredRule = {
	[ INPUT_VALIDATION_RULES.isRequired ]: boolean;
};

export type Rules< Item > = RequiredRule;

export type NormalizedRule< Item > = (
	item: Item,
	context?: ValidationContext
) => boolean | string;
