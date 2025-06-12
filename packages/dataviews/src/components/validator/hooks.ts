import { useCallback, useMemo, useReducer } from 'react';
import { Field, FormField, NormalizedField } from '../../types';
import { FormValidationState } from './types';
import { NormalizedFormField } from '../../normalize-form-fields';

const initialState: FormValidationState = {
	touchedFields: [],
	errorMessages: {},
	isFormValid: false,
	setTouchedFields: () => {},
	setErrors: () => {},
	removeError: () => {},
};

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

const validationReducer = (
	state: FormValidationState,
	action: ValidationAction
): FormValidationState => {
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

		case 'REMOVE_ERROR': {
			const { [ action.payload ]: _, ...rest } = state.errorMessages;
			return {
				...state,
				errorMessages: rest,
			};
		}

		case 'RESET_VALIDATION':
			return initialState;

		default:
			return state;
	}
};

export const useValidation = (): FormValidationState => {
	const [ validationState, dispatch ] = useReducer(
		validationReducer,
		initialState
	);

	const setTouchedFields = useCallback( ( touchedFields: string[] ) => {
		dispatch( { type: 'SET_TOUCHED_FIELDS', payload: touchedFields } );
	}, [] );

	const setErrors = useCallback(
		( field: string, error: Record< string, string | undefined > ) =>
			dispatch( {
				type: 'SET_ERRORS',
				payload: { field, errors: error },
			} ),
		[ dispatch ]
	);

	const removeError = useCallback(
		( field: string ) =>
			dispatch( { type: 'REMOVE_ERROR', payload: field } ),
		[ dispatch ]
	);

	const isFormValid = useMemo(
		() => Object.keys( validationState.errorMessages ).length === 0,
		[ validationState.errorMessages ]
	);

	console.log( isFormValid );

	return {
		touchedFields: validationState.touchedFields,
		errorMessages: validationState.errorMessages,
		setTouchedFields,
		setErrors,
		removeError,
		isFormValid,
	};
};

export function useFieldValidation< Item >(
	field: NormalizedFormField,
	data: Item,
	fieldDefinition: NormalizedField< Item > | undefined,
	validation: FormValidationState,
	onChange: ( value: any ) => void
) {
	return useCallback(
		( value: any ) => {
			onChange( value );

			if ( ! validation.touchedFields?.includes( field.id ) ) {
				validation.setTouchedFields( [ field.id ] );
			}

			const errors = fieldDefinition?.rules.reduce(
				( acc, rule ) => {
					const error = rule.callback(
						value[ field.id ],
						fieldDefinition,
						data
					);

					return {
						...acc,
						...( error && { [ rule.type ]: error } ),
					};
				},
				{} as Record< string, string >
			);

			if ( errors && Object.keys( errors ).length > 0 ) {
				validation.setErrors( field.id, errors );
			} else {
				validation.removeError( field.id );
			}
		},
		[ field.id, fieldDefinition, validation, onChange ]
	);
}

export function useFieldError< Item >(
	field: NormalizedFormField,
	fieldDefinition: NormalizedField< Item > | undefined,
	validation: FormValidationState
) {
	return useMemo( () => {
		if ( validation.touchedFields.includes( field.id ) ) {
			const requiredError =
				validation?.errorMessages?.[ field.id ]?.[ 'required' ];

			if ( requiredError ) {
				return requiredError;
			}

			return Object.entries(
				validation?.errorMessages?.[ field.id ] ?? {}
			)
				.filter( ( [ key ] ) => key !== 'required' )
				.map( ( [ _, error ] ) => error )[ 0 ];
		}
		return '';
	}, [ field.id, fieldDefinition, validation ] );
}
