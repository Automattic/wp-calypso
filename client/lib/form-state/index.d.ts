export interface FieldState {
	value: any;
	errors: string[] | null;
	isShowingErrors: boolean;
	isPendingValidation: boolean;
	isValidating: boolean;
}

export interface FormState {
	[ key: string ]: FieldState;
}

export interface ControllerOptions {
	initialState?: FormState;
	initialFields?: { [ key: string ]: any };
	fieldNames?: string[];
	sanitizerFunction?: ( fieldValues: any, callback: ( newFieldValues: any ) => void ) => void;
	validatorFunction?: (
		fieldValues: any,
		callback: ( error: any, fieldErrors: any ) => void
	) => void;
	skipSanitizeAndValidateOnFieldChange?: boolean;
	loadFunction?: ( callback: ( error: any, fieldValues: any ) => void ) => void;
	onNewState: ( newState: FormState ) => void;
	onError: ( error: any ) => void;
	debounceWait?: number;
	hideFieldErrorsOnChange?: boolean;
}

export class Controller {
	constructor( options: ControllerOptions );
	getInitialState(): FormState;
	handleFieldChange( change: { name: string; value: any; hideError?: boolean } ): void;
	handleSubmit( onComplete: ( hasErrors: boolean ) => void ): void;
	sanitize(): void;
	validate(): void;
	resetFields( fieldValues: { [ key: string ]: any } ): void;
}

export function getFieldValue( formState: FormState, fieldName: string ): any;
export function setFieldsValidating( formState: FormState ): FormState;
export function setFieldErrors(
	formState: FormState,
	fieldErrors: { [ key: string ]: string[] },
	hideFieldErrorsOnChange: boolean
): FormState;
export function getErrorMessages( formState: FormState ): string[];
export function getInvalidFields( formState: FormState ): { [ key: string ]: FieldState };
export function getFieldErrorMessages(
	formState: FormState,
	fieldName: string
): string[] | undefined;
export function hasErrors( formState: FormState ): boolean;
export function isFieldDisabled( formState: FormState, fieldName: string ): boolean;
export function isFieldInvalid( formState: FormState, fieldName: string ): boolean;
export function isFieldPendingValidation( formState: FormState, fieldName: string ): boolean;
export function isFieldValidating( formState: FormState, fieldName: string ): boolean;
export function getAllFieldValues( formState: FormState ): { [ key: string ]: any };
export function isSubmitButtonDisabled( formState: FormState ): boolean;
export function isFieldValid( formState: FormState, fieldName: string ): boolean;
export function isFieldPossiblyValid( formState: FormState, fieldName: string ): boolean;
export function showFieldValidationLoading( formState: FormState, fieldName: string ): boolean;
export function createInitialFormState( fieldValues: { [ key: string ]: any } ): FormState;
export function createNullFieldValues( fieldNames: string[] ): { [ key: string ]: null };
export function initializeFields(
	formState: FormState,
	fieldValues: { [ key: string ]: any }
): FormState;
export function changeFieldValue(
	formState: FormState,
	name: string,
	value: any,
	hideFieldErrorsOnChange: boolean
): FormState;

declare const _default: {
	Controller: typeof Controller;
	getFieldValue: typeof getFieldValue;
	setFieldsValidating: typeof setFieldsValidating;
	setFieldErrors: typeof setFieldErrors;
	getErrorMessages: typeof getErrorMessages;
	getInvalidFields: typeof getInvalidFields;
	getFieldErrorMessages: typeof getFieldErrorMessages;
	hasErrors: typeof hasErrors;
	isFieldDisabled: typeof isFieldDisabled;
	isFieldInvalid: typeof isFieldInvalid;
	isFieldPendingValidation: typeof isFieldPendingValidation;
	isFieldValidating: typeof isFieldValidating;
	getAllFieldValues: typeof getAllFieldValues;
	isSubmitButtonDisabled: typeof isSubmitButtonDisabled;
	isFieldValid: typeof isFieldValid;
	isFieldPossiblyValid: typeof isFieldPossiblyValid;
	showFieldValidationLoading: typeof showFieldValidationLoading;
	createInitialFormState: typeof createInitialFormState;
	createNullFieldValues: typeof createNullFieldValues;
	initializeFields: typeof initializeFields;
	changeFieldValue: typeof changeFieldValue;
};

export default _default;
