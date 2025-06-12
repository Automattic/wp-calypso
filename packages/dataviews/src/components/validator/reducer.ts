import { FormValidationState } from './types';

type ValidationAction =
	| { type: 'SET_TOUCHED_FIELDS'; payload: string[] }
	| {
			type: 'SET_ERRORS';
			payload: {
				field: string;
				errors: Record< string, string | undefined >;
			};
	  }
	| { type: 'REMOVE_ERROR'; payload: string }
	| { type: 'RESET_VALIDATION' };

const initialState: FormValidationState = {
	touchedFields: [],
	errorMessages: {},
	setTouchedFields: () => {},
	setErrors: () => {},
	removeError: () => {},
	isFormValid: () => false,
};

export function validationReducer(
	state: FormValidationState,
	action: ValidationAction
): FormValidationState {
	switch ( action.type ) {
		case 'SET_TOUCHED_FIELDS':
			return {
				...state,
				touchedFields: [ ...state.touchedFields, ...action.payload ],
			};

		case 'SET_ERRORS':
			return {
				...state,
				errorMessages: {
					...state.errorMessages,
					[ action.payload.field ]: action.payload.errors,
				},
			};

		case 'REMOVE_ERROR':
			const { [ action.payload ]: _, ...rest } = state.errorMessages;
			return {
				...state,
				errorMessages: rest,
			};

		case 'RESET_VALIDATION':
			return {
				...initialState,
				setTouchedFields: state.setTouchedFields,
				setErrors: state.setErrors,
				removeError: state.removeError,
				isFormValid: state.isFormValid,
			};

		default:
			return state;
	}
}
